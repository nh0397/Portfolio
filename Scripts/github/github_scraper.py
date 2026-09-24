"""Fetch public repository facts without asking an LLM to rewrite them."""
import base64
import os
import requests


def fetch_github_repositories(username):
    if not username:
        raise ValueError("GITHUB_USERNAME is required")
    headers = {"Accept": "application/vnd.github+json"}
    token = os.getenv("GITHUB_ACCESS_TOKEN") or os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    repos = []
    page = 1
    while True:
        response = requests.get(
            f"https://api.github.com/users/{username}/repos",
            params={"per_page": 100, "page": page, "sort": "updated", "type": "owner"},
            headers=headers, timeout=30,
        )
        response.raise_for_status()
        batch = response.json()
        if not batch:
            break
        for repo in batch:
            if repo.get("private"):
                continue
            readme = requests.get(f"https://api.github.com/repos/{repo['full_name']}/readme",
                                  headers=headers, timeout=30)
            if readme.status_code == 404:
                text = ""
            else:
                readme.raise_for_status()
                text = base64.b64decode(readme.json()["content"]).decode("utf-8", errors="replace")
            repos.append({
                "name": repo["name"], "description": repo.get("description") or "",
                "readme": text, "language": repo.get("language") or "",
                "topics": repo.get("topics", []), "stars": repo["stargazers_count"],
                "url": repo["html_url"], "homepage": repo.get("homepage") or "",
                "created": repo["created_at"], "last_updated": repo["pushed_at"],
            })
        page += 1
    if not repos:
        raise ValueError("GitHub returned no public repositories; refusing an empty refresh")
    return repos
