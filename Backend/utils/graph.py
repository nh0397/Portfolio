import os
import re
from neo4j import GraphDatabase

class GraphRAG:
    _cached_schema = None  # Class-level cache — survives across requests

    def __init__(self):
        self.uri = os.getenv('NEO4J_URI')
        self.user = os.getenv('NEO4J_USER')
        self.password = os.getenv('NEO4J_PASSWORD')

        # ── Few-shot examples for the LLM ──
        self.examples = """
Q: What skills does Naisarg have?
Cypher: MATCH (p:Person)-[:HAS_SKILL]->(s:Skill) WHERE toLower(p.name) CONTAINS 'naisarg' RETURN s.name

Q: Which projects use React?
Cypher: MATCH (prj:Project)-[:USES_TECH]->(s:Skill) WHERE toLower(s.name) CONTAINS 'react' RETURN prj.name, prj.description

Q: What companies has Naisarg worked at?
Cypher: MATCH (p:Person)-[r:WORKED_AT]->(c:Company) WHERE toLower(p.name) CONTAINS 'naisarg' RETURN c.name, r.start_date, r.end_date

Q: What roles did Naisarg hold?
Cypher: MATCH (p:Person)-[:WORKED_AT]->(comp:Company)-[:HAS_ROLE]->(role:Role) WHERE toLower(p.name) CONTAINS 'naisarg' RETURN comp.name, role.name

Q: What skills were used at Mu Sigma?
Cypher: MATCH (c:Company)-[:HAS_ROLE]->(r:Role)-[:USED_SKILL]->(s:Skill) WHERE toLower(c.name) CONTAINS 'mu sigma' RETURN r.name, collect(s.name) AS skills

Q: What are Naisarg's top skills?
Cypher: MATCH (p:Person)-[:HAS_SKILL]->(skill:Skill) WHERE toLower(p.name) CONTAINS 'naisarg' RETURN skill.name, COUNT { (p)-[:HAS_SKILL]->(skill) } AS relevance ORDER BY relevance DESC LIMIT 5

Q: What awards did Naisarg receive?
Cypher: MATCH (p:Person)-[:RECEIVED_AWARD]->(a:Award)-[:GIVEN_BY]->(org:Company) RETURN a.name, org.name

Q: Where does Naisarg currently work?
Cypher: MATCH (p:Person)-[r:WORKED_AT]->(c:Company) WHERE toLower(p.name) CONTAINS 'naisarg' AND (r.end_date IS NULL OR toLower(r.end_date) CONTAINS 'present') RETURN c.name, r.role, r.start_date

Q: What is Naisarg's work history?
Cypher: MATCH (p:Person)-[r:WORKED_AT]->(c:Company) WHERE toLower(p.name) CONTAINS 'naisarg' RETURN c.name, r.role, r.start_date, r.end_date ORDER BY r.start_date DESC
"""

    def _get_driver(self):
        """Create a new Neo4j driver instance."""
        return GraphDatabase.driver(self.uri, auth=(self.user, self.password))

    def _fetch_schema(self):
        """Introspect the live Neo4j database for its actual schema."""
        driver = None
        try:
            driver = self._get_driver()
            with driver.session() as session:
                # 1. Get all node labels and their properties
                labels_result = session.run("""
                    CALL db.schema.nodeTypeProperties()
                    YIELD nodeLabels, propertyName, propertyTypes
                    RETURN nodeLabels, collect(propertyName) AS properties
                """)
                nodes = {}
                for record in labels_result:
                    label = record["nodeLabels"][0] if record["nodeLabels"] else "Unknown"
                    props = [p for p in record["properties"] if p]
                    if label not in nodes:
                        nodes[label] = set()
                    nodes[label].update(props)

                # 2. Get all relationship types and their properties
                rels_result = session.run("""
                    CALL db.schema.relTypeProperties()
                    YIELD relType, propertyName, propertyTypes
                    RETURN relType, collect(propertyName) AS properties
                """)
                relationships = {}
                for record in rels_result:
                    rel_type = record["relType"].replace(":`", "").replace("`", "")
                    props = [p for p in record["properties"] if p]
                    if rel_type not in relationships:
                        relationships[rel_type] = set()
                    relationships[rel_type].update(props)

                # 3. Get relationship connections (which nodes connect via which rels)
                connections_result = session.run("""
                    CALL db.schema.visualization()
                    YIELD nodes, relationships
                    RETURN nodes, relationships
                """)
                connections = []
                for record in connections_result:
                    for rel in record["relationships"]:
                        start_label = rel.start_node["name"] if "name" in rel.start_node else str(list(rel.start_node.labels)[0])
                        end_label = rel.end_node["name"] if "name" in rel.end_node else str(list(rel.end_node.labels)[0])
                        connections.append(f"  ({start_label})-[:{rel.type}]->({end_label})")

                # Build schema string
                schema_parts = ["Node Labels and Properties:"]
                for label, props in sorted(nodes.items()):
                    prop_str = ", ".join(sorted(props)) if props else ""
                    schema_parts.append(f"  - {label} {{{prop_str}}}" if prop_str else f"  - {label}")

                schema_parts.append("\nRelationship Types and Properties:")
                for rel_type, props in sorted(relationships.items()):
                    prop_str = ", ".join(sorted(props)) if props else ""
                    schema_parts.append(f"  - {rel_type} {{{prop_str}}}" if prop_str else f"  - {rel_type}")

                if connections:
                    schema_parts.append("\nRelationship Connections:")
                    schema_parts.extend(connections)

                # 4. Get counts for context
                count_result = session.run("MATCH (n) RETURN count(n) as nodes")
                node_count = count_result.single()["nodes"]
                rel_count_result = session.run("MATCH ()-[r]->() RETURN count(r) as rels")
                rel_count = rel_count_result.single()["rels"]
                schema_parts.append(f"\nDatabase Stats: {node_count} nodes, {rel_count} relationships")

                schema = "\n".join(schema_parts)
                print(f"📊 Fetched live schema from Neo4j ({node_count} nodes, {rel_count} rels)")
                return schema

        except Exception as e:
            print(f"⚠️ Schema introspection failed, using fallback: {e}")
            return self._fallback_schema()
        finally:
            if driver:
                driver.close()

    def _fallback_schema(self):
        """Static fallback schema in case introspection fails."""
        return """
Node Labels and Properties:
  - Person {name, email}
  - Company {name}
  - Role {name}
  - Skill {name}
  - Project {name, description, github_url}
  - Institution {name}
  - Degree {name, field}
  - Certification {name}
  - Award {name}

Relationships:
  - (Person)-[:WORKED_AT {start_date, end_date, description}]->(Company)
  - (Company)-[:HAS_ROLE]->(Role)
  - (Role)-[:USED_SKILL]->(Skill)
  - (Person)-[:HAS_SKILL]->(Skill)
  - (Person)-[:STUDIED_AT {start_date, end_date}]->(Institution)
  - (Institution)-[:AWARDED]->(Degree)
  - (Person)-[:HAS_DEGREE]->(Degree)
  - (Person)-[:CERTIFIED_IN {date}]->(Certification)
  - (Certification)-[:ISSUED_BY]->(Company)
  - (Person)-[:RECEIVED_AWARD {date}]->(Award)
  - (Award)-[:GIVEN_BY]->(Company)
  - (Person)-[:CREATED]->(Project)
  - (Project)-[:USES_TECH]->(Skill)
"""

    def get_schema(self):
        """Get the graph schema — fetches from Neo4j on first call, then caches."""
        if GraphRAG._cached_schema is None:
            print("🔍 First call — fetching live schema from Neo4j...")
            GraphRAG._cached_schema = self._fetch_schema()
        else:
            print("⚡ Using cached schema")
        return GraphRAG._cached_schema

    def generate_cypher(self, question, llm_provider):
        """Generate a Cypher query from a natural language question with a self-correction loop."""
        schema = self.get_schema()

        base_prompt = f"""You are a Neo4j Cypher expert. Given the graph schema and examples below, translate the user's question into a valid Cypher query.

SCHEMA:
{schema}

FEW-SHOT EXAMPLES:
{self.examples}

STRICT STRUCTURAL RULES:
1. Return ONLY the Cypher query. No explanation, no markdown, no backticks.
2. Every query MUST end with a RETURN clause.
3. Use toLower() for case-insensitive string matching.
4. Use CONTAINS for resilient string/name matching (Person names are usually 'Naisarg Halvadiya').
5. ALWAYS filter by Person name if the question is about 'his', 'her', or 'Naisarg'.
6. Match MULTIPLE paths by separating them with a comma in ONE MATCH clause.
   Example: MATCH (p:Person), (p)-[:CREATED]->(prj:Project)
7. NEVER use multiple WHERE clauses. Use AND to combine filters.
8. NEVER put a relationship pattern inside toLower() or size(). 
   WRONG: WHERE toLower( (p)-[:WORKED_AT]->(c:Company) ) CONTAINS 'mu sigma'
   RIGHT: MATCH (p)-[:WORKED_AT]->(c:Company) WHERE toLower(c.name) CONTAINS 'mu sigma'
9. NEVER use size((a)-[:R]->(b)). ALWAYS use COUNT {{ (a)-[:R]->(b) }} for relationship counts.
10. NEVER reuse variable names (e.g. 'r') for different nodes or relationships in the same query. Use descriptive names like 'role:Role', 'comp:Company'.
11. If the question doesn't map to the schema, return: MATCH (p:Person) RETURN p.name, p.email
"""
        
        # 1. First Attempt
        prompt = f"{base_prompt}\nQuestion: {question}\nCypher:"
        try:
            cypher = llm_provider.generate_content(prompt)
            cypher = self._clean_cypher(cypher)

            if not self._validate_cypher(cypher):
                print(f"⚠️ Invalid Cypher (no RETURN): {cypher}")
                return "MATCH (p:Person)-[:HAS_SKILL]->(s:Skill) RETURN s.name"

            # 2. Dry Run / Initial Verification
            # Instead of executing directly, we check for common syntax errors 
            # or try to execute and catch the Exception.
            try:
                # We try to run the query to see if it's valid
                self.query(cypher)
                return cypher
            except Exception as syntax_error:
                print(f"🔄 Self-Correction Triggered! Error: {syntax_error}")
                # 3. Second Attempt (Correction)
                correction_prompt = f"""{base_prompt}
Your previous Cypher query failed with a syntax error.

FAILED QUERY: {cypher}
ERROR MESSAGE: {syntax_error}

Please FIX the Cypher query based on the error message and the STRICT RULES.
Question: {question}
Corrected Cypher:"""
                
                corrected_cypher = llm_provider.generate_content(correction_prompt)
                corrected_cypher = self._clean_cypher(corrected_cypher)
                print(f"✅ Corrected Cypher: {corrected_cypher}")
                return corrected_cypher

        except Exception as e:
            print(f"❌ Cypher generation chain failed: {e}")
            return "MATCH (p:Person)-[:HAS_SKILL]->(s:Skill) RETURN s.name"

    def _clean_cypher(self, cypher):
        """Strip markdown fences and whitespace from LLM output."""
        cypher = cypher.replace('```cypher', '').replace('```', '').strip()
        cypher = re.sub(r'^(?:Cypher:\s*)', '', cypher, flags=re.IGNORECASE).strip()
        cypher = re.sub(r'^(?:Corrected Cypher:\s*)', '', cypher, flags=re.IGNORECASE).strip()
        return cypher

    def _validate_cypher(self, cypher):
        """Basic validation: Cypher must contain a RETURN clause."""
        if not cypher:
            return False
        return 'RETURN' in cypher.upper()

    def query(self, cypher):
        """Execute a Cypher query against Neo4j. Raises exception on syntax error."""
        if not all([self.uri, self.user, self.password, cypher]):
            return []
        driver = None
        try:
            driver = self._get_driver()
            with driver.session() as session:
                result = session.run(cypher)
                return [record.data() for record in result]
        except Exception as e:
            # Raise the exception so generate_cypher can catch it for correction
            raise e
        finally:
            if driver:
                driver.close()
