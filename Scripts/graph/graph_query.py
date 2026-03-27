import os
import logging
from neo4j import GraphDatabase
from google import genai
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

SCHEMA_PROMPT = """
Nodes:
- Person {name, email}
- Project {name, description, url, github_url}
- Skill {name}
- Company {name}
- Role {name}
- Institution {name}
- Degree {name, field}
- Certification {name, date}
- Award {name, date}

Relationships:
- (Person)-[:HAS_SKILL]->(Skill)
- (Person)-[:WORKED_AT {start_date, end_date, description}]->(Company)
- (Company)-[:HAS_ROLE]->(Role)
- (Role)-[:USED_SKILL]->(Skill)
- (Person)-[:STUDIED_AT {start_date, end_date}]->(Institution)
- (Institution)-[:AWARDED]->(Degree)
- (Person)-[:HAS_DEGREE]->(Degree)
- (Person)-[:CERTIFIED_IN]->(Certification)
- (Certification)-[:ISSUED_BY]->(Company)
- (Person)-[:RECEIVED_AWARD]->(Award)
- (Award)-[:GIVEN_BY]->(Company)
- (Project)-[:USES_TECH]->(Skill)
- (Person)-[:CREATED]->(Project)
"""

def generate_cypher(question):
    """
    Translate natural language question to Cypher using Gemini.
    """
    client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
    
    prompt = f"""
    You are an expert Neo4j developer. Convert the following natural language question into a Cypher query.
    
    Database Schema:
    {SCHEMA_PROMPT}
    
    Rules:
    - Return ONLY the Cypher query text. 
    - No markdown formatting, no backticks, just the query.
    - Be case-insensitive for names where possible (use toLower() or exact matches).
    - If the question is not about the portfolio, return an empty string.

    Question: "{question}"
    Cypher:"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip().replace('```cypher', '').replace('```', '')
    except Exception as e:
        logger.error(f"Failed to generate Cypher: {e}")
        return None

def execute_query(cypher):
    """
    Execute Cypher query and return results.
    """
    uri = os.getenv('NEO4J_URI', '').strip()
    user = os.getenv('NEO4J_USER', '').strip()
    password = os.getenv('NEO4J_PASSWORD', '').strip()

    if not all([uri, user, password, cypher]):
        return []

    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        with driver.session() as session:
            result = session.run(cypher)
            return [record.data() for record in result]
    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        return []
    finally:
        driver.close()

def ask_graph(question):
    """
    Wrapper for NL2Cypher flow.
    """
    logger.info(f"Question: {question}")
    cypher = generate_cypher(question)
    
    if not cypher:
        print("I couldn't translate that into a database query.")
        return

    logger.info(f"Generated Cypher: {cypher}")
    results = execute_query(cypher)
    
    if not results:
        print("No matches found in the Knowledge Graph.")
    else:
        print("\n--- Knowledge Graph Results ---")
        for i, res in enumerate(results):
            print(f"{i+1}. {res}")
        print("-------------------------------\n")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
        ask_graph(query)
    else:
        print("Usage: python graph_query.py \"Your question here\"")
