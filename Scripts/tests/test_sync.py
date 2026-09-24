import json
from pathlib import Path
import sys
import unittest
from unittest.mock import MagicMock, patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "Scripts"))
import sync_portfolio as sync
import ingest
from github.github_scraper import fetch_github_repositories


def sources():
    data = {name: json.loads((sync.SOURCES / filename).read_text(encoding="utf-8"))
            for name, filename in [("resume", "resume.json"), ("linkedin", "linkedin.json"),
                                   ("featured_work", "featured-work.json")]}
    data["github"] = [{"name": "new-project", "url": "https://github.com/example/new-project",
                       "description": "New project", "last_updated": "2026-09-20T00:00:00Z"}]
    return data


class SyncTests(unittest.TestCase):
    def test_github_timestamp_and_long_readme_preserve_date(self):
        self.assertEqual(ingest.parse_date("2026-09-20T14:23:01Z"), "2026-09-20")
        chunks = ingest.split_oversized(ingest.chunk_json("github", [{
            "name": "repo", "last_updated": "2026-09-20T14:23:01Z", "readme": "x" * 6000}]))
        self.assertTrue(all(c["date"] == "2026-09-20" for c in chunks))

    def test_same_sources_feed_ui_and_chunks(self):
        payload, chunks = sync.prepare(sources())
        self.assertEqual(payload["repos"][0]["name"], "new-project")
        self.assertTrue(any("new-project" in c["text"] for c in chunks))
        self.assertEqual(payload["featuredWork"][0]["id"], "agent-ui-execution-engine")
        self.assertTrue(any(c["source"] == "featured_work" for c in chunks))
        self.assertTrue(all(c["source_hash"] == payload["sourceHash"] and c["ingested_at"] for c in chunks))

    def test_invalid_sources_stop_before_publication(self):
        data = sources()
        data["resume"]["work_experience"][0]["title"] = ""
        with self.assertRaises(ValueError):
            sync.prepare(data)

    def test_invalid_featured_metrics_stop_before_publication(self):
        data = sources()
        data["featured_work"][0]["metrics"] = ["not a metric"]
        with self.assertRaises(ValueError):
            sync.prepare(data)
        data = sources()
        data["github"] = []
        with self.assertRaises(ValueError):
            sync.prepare(data)

    def test_long_readme_lines_are_bounded_and_keep_metadata(self):
        chunk = {"text": "x" * 5000, "source": "github", "section": "README", "date": "2026-09-01"}
        result = ingest.split_oversized([chunk])
        self.assertTrue(all(len(c["text"]) <= ingest.MAX_CHUNK_CHARS for c in result))
        self.assertEqual("".join(c["text"] for c in result), chunk["text"])
        self.assertTrue(all(c["date"] == chunk["date"] for c in result))

    @patch.object(sync, "FRONTEND_DATA_FILE")
    @patch.object(sync, "publish_chunks", side_effect=RuntimeError("database unavailable"))
    @patch.object(sync, "load_sources", side_effect=sources)
    def test_db_failure_does_not_write_ui(self, load, publish, file):
        with patch.object(sys, "argv", ["sync"]), self.assertRaises(RuntimeError):
            sync.main()
        file.write_text.assert_not_called()

    @patch.object(sync, "FRONTEND_DATA_FILE")
    @patch.object(sync, "publish_chunks")
    @patch.object(sync, "load_sources", side_effect=sources)
    def test_dry_run_writes_nothing(self, load, publish, file):
        with patch.object(sys, "argv", ["sync", "--dry-run"]):
            sync.main()
        publish.assert_not_called()
        file.write_text.assert_not_called()

    def test_index_name_shared_with_retrieval_and_creation_waits(self):
        collection = MagicMock()
        def create(model):
            definition = model.document["definition"]
            self.assertEqual(model.document["name"], sync.CHUNKS_INDEX)
            collection.list_search_indexes.return_value = [{"name": sync.CHUNKS_INDEX,
                "latestDefinition": definition, "status": "READY", "queryable": True}]
        collection.list_search_indexes.return_value = []
        collection.create_search_index.side_effect = create
        ingest.ensure_vector_index(collection)
        collection.create_search_index.assert_called_once()

    def test_wrong_index_definition_is_updated(self):
        collection = MagicMock()
        collection.list_search_indexes.return_value = [{"name": sync.CHUNKS_INDEX, "latestDefinition": {}}]
        def update(name, definition):
            collection.list_search_indexes.return_value = [{"name": name, "latestDefinition": definition,
                                                            "status": "READY", "queryable": True}]
        collection.update_search_index.side_effect = update
        ingest.ensure_vector_index(collection)
        collection.update_search_index.assert_called_once()

    def test_failed_index_stops_publication(self):
        collection = MagicMock()
        collection.list_search_indexes.return_value = [{"name": sync.CHUNKS_INDEX, "status": "FAILED"}]
        with self.assertRaises(RuntimeError):
            ingest.ensure_vector_index(collection)

    @patch("github.github_scraper.requests.get")
    def test_github_pagination_and_missing_readme(self, get):
        repo = {"name": "one", "full_name": "owner/one", "html_url": "https://github.com/owner/one",
                "stargazers_count": 0, "created_at": "2026-01-01", "pushed_at": "2026-09-01"}
        second = {**repo, "name": "two", "full_name": "owner/two"}
        def response(value, status=200):
            result = MagicMock(status_code=status)
            result.json.return_value = value
            return result
        get.side_effect = [response([repo]), response({}, 404), response([second]),
                           response({}, 404), response([])]
        result = fetch_github_repositories("owner")
        self.assertEqual([r["name"] for r in result], ["one", "two"])
        self.assertEqual(result[0]["readme"], "")
        self.assertEqual(get.call_args.kwargs["params"]["page"], 3)

    @patch.object(sync, "ensure_vector_index")
    @patch.object(sync, "mongo_client")
    @patch.object(sync, "embed_chunks")
    def test_database_replacement_uses_transaction(self, embed, mongo, index):
        embed.return_value = [{"embedding": [0.0] * sync.EMBEDDING_DIMS}]
        client = mongo.return_value.__enter__.return_value
        db = client.__getitem__.return_value
        db.list_collection_names.return_value = [sync.CHUNKS_COLLECTION]
        collection = db.__getitem__.return_value
        session = client.start_session.return_value.__enter__.return_value
        session.with_transaction.side_effect = lambda callback: callback(session)
        env = {key: "configured" for key in ("MONGO_USERNAME", "MONGO_PASSWORD", "MONGO_HOST",
                                               "MONGO_DB_NAME", "FIREWORKS_API_KEY")}
        with patch.dict(sync.os.environ, env):
            sync.publish_chunks([{}])
        collection.delete_many.assert_called_once_with({}, session=session)
        collection.insert_many.assert_called_once_with(embed.return_value, session=session)
        session.with_transaction.assert_called_once()


if __name__ == "__main__":
    unittest.main()
