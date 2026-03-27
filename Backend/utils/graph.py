import os
import json
from neo4j import GraphDatabase

class GraphRAG:
    def __init__(self):
        self.uri = os.getenv('NEO4J_URI')
        self.user = os.getenv('NEO4J_USER')
        self.password = os.getenv('NEO4J_PASSWORD')
        self.schema = """
        Nodes:
        - Person {name, email}
        - Project {name, description}
        - Skill {name}
        - Company {name}
        - Role {name}
        - Institution {name}
        - Degree {name, field}
        - Certification {name, date}
        - Award {name, date}
        Relationships:
        - (Person)-[:HAS_SKILL]->(Skill)
        - (Person)-[:WORKED_AT]->(Company)-[:HAS_ROLE]->(Role)
        - (Role)-[:USED_SKILL]->(Skill)
        - (Project)-[:USES_TECH]->(Skill)
        """

    def generate_cypher(self, question, llm_provider):
        prompt = f"""Translate this portfolio question into a Neo4j Cypher query.
        Schema: {self.schema}
        Rules: Return ONLY Cypher query. No markdown. Be case-insensitive.
        Question: {question}
        Cypher:"""
        try:
            cypher = llm_provider.generate_content(prompt)
            # Basic cleanup
            cypher = cypher.replace('```cypher', '').replace('```', '').strip()
            return cypher
        except Exception as e:
            print(f"❌ Cypher generation failed: {e}")
            return None

    def query(self, cypher):
        if not all([self.uri, self.user, self.password, cypher]):
            print("⚠️ Skipping graph query: missing credentials or cypher")
            return []
        try:
            driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            with driver.session() as session:
                result = session.run(cypher)
                return [record.data() for record in result]
        except Exception as e:
            print(f"❌ Graph query failed: {e}")
            return []
        finally:
            if 'driver' in locals(): driver.close()
