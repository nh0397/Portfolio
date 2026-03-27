import os
import json
import logging
import time
from neo4j import GraphDatabase
from google import genai

logger = logging.getLogger(__name__)

def extract_skills_from_text(text, all_known_skills):
    """
    Use Gemini to extract relevant skills and technologies from a block of text,
    filtered by a list of known skills to maintain consistency.
    """
    if not text or not os.getenv('GOOGLE_API_KEY'):
        return []

    prompt = f"""
    Internalize the following list of professional skills:
    {', '.join(list(all_known_skills)[:100])}... (and other related technical skills)

    From the following text, extract ONLY the technical skills, tools, or methodologies mentioned that align with the list above or are clearly technical:
    
    TEXT: "{text}"
    
    Return the result as a comma-separated list of skills only. If none found, return an empty string.
    """
    
    try:
        client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        extracted = [s.strip() for s in response.text.split(',') if s.strip()]
        return extracted
    except Exception as e:
        logger.warning(f"Skill extraction failed: {e}")
        return []

def ingest_into_graph(final_data):
    """
    Zero Data Loss Ingestion: Captures all details from final_data.json into Neo4j.
    """
    logger.info("Starting Zero Data Loss Ingestion...")
    
    uri = os.getenv('NEO4J_URI', '').strip()
    user = os.getenv('NEO4J_USER', '').strip()
    password = os.getenv('NEO4J_PASSWORD', '').strip()
    
    if not all([uri, user, password]):
        logger.warning("Neo4j credentials missing. Skipping.")
        return

    try:
        driver = GraphDatabase.driver(uri, auth=(user, password))
        driver.verify_connectivity()
        
        # Pre-calculate all known skills for extraction context
        all_skills = set(final_data["resume"].get("skills", [])) | set(final_data["linkedin"].get("skills", []))

        with driver.session() as session:
            # 1. PERSON
            session.run(
                "MERGE (p:Person {name: $name, email: $email})",
                name=final_data["Name"], email=final_data["email"]
            )
            
            # 2. EXPERIENCE & SKILL EXTRACTION
            for key in ["resume", "linkedin"]:
                for exp in final_data[key].get("work_experience", []):
                    # Create job/role nodes
                    session.run("""
                        MERGE (c:Company {name: $company})
                        MERGE (r:Role {name: $role})
                        WITH c, r
                        MATCH (p:Person {name: $name})
                        MERGE (p)-[rel:WORKED_AT]->(c)
                        SET rel.start_date = $start, rel.end_date = $end, rel.description = $desc
                        MERGE (c)-[:HAS_ROLE]->(r)
                        """, 
                        company=exp["company_name"], 
                        role=exp["designation"],
                        name=final_data["Name"],
                        start=exp.get("start_date"),
                        end=exp.get("end_date"),
                        desc=exp.get("description")
                    )
                    
                    # Extract skills from description and link them to the Role
                    desc_skills = extract_skills_from_text(exp.get("description"), all_skills)
                    for s_name in desc_skills:
                        session.run("""
                            MERGE (s:Skill {name: $skill})
                            WITH s
                            MATCH (c:Company {name: $company})-->(r:Role {name: $role})
                            MERGE (r)-[:USED_SKILL]->(s)
                            """,
                            skill=s_name, company=exp["company_name"], role=exp["designation"]
                        )
                    if desc_skills:
                        logger.info(f"Extracted {len(desc_skills)} skills for {exp['designation']} at {exp['company_name']}")

            # 3. EDUCATION
            for edu in final_data["linkedin"].get("education", []):
                session.run("""
                    MERGE (i:Institution {name: $inst})
                    MERGE (d:Degree {name: $degree, field: $field})
                    WITH i, d
                    MATCH (p:Person {name: $name})
                    MERGE (p)-[rel:STUDIED_AT]->(i)
                    SET rel.start_date = $start, rel.end_date = $end
                    MERGE (i)-[:AWARDED]->(d)
                    MERGE (p)-[:HAS_DEGREE]->(d)
                    """,
                    inst=edu["institution_name"], degree=edu["degree"], field=edu["field_of_study"],
                    name=final_data["Name"], start=edu.get("start_date"), end=edu.get("end_date")
                )

            # 4. CERTIFICATIONS
            for cert in final_data["linkedin"].get("certifications", []):
                session.run("""
                    MERGE (cert:Certification {name: $cert_name})
                    MERGE (org:Company {name: $org_name})
                    WITH cert, org
                    MATCH (p:Person {name: $name})
                    MERGE (p)-[rel:CERTIFIED_IN]->(cert)
                    SET rel.date = $date
                    MERGE (cert)-[:ISSUED_BY]->(org)
                    """,
                    cert_name=cert["certification_name"], org_name=cert["issuing_organization"],
                    name=final_data["Name"], date=cert.get("issue_date")
                )

            # 5. AWARDS
            for award in final_data["linkedin"].get("honors_and_awards", []):
                session.run("""
                    MERGE (awd:Award {name: $award_name})
                    MERGE (org:Company {name: $org_name})
                    WITH awd, org
                    MATCH (p:Person {name: $name})
                    MERGE (p)-[rel:RECEIVED_AWARD]->(awd)
                    SET rel.date = $date
                    MERGE (awd)-[:GIVEN_BY]->(org)
                    """,
                    award_name=award["award_name"], org_name=award["issuing_organization"],
                    name=final_data["Name"], date=award.get("issue_date")
                )

            # 6. ALL SKILLS (Global list)
            for skill_name in all_skills:
                session.run("""
                    MERGE (s:Skill {name: $skill})
                    WITH s
                    MATCH (p:Person {name: $name})
                    MERGE (p)-[:HAS_SKILL]->(s)
                    """, 
                    skill=skill_name, name=final_data["Name"]
                )

            # 7. PROJECTS (Merged: Resume + GitHub)
            # From Resume
            for prj in final_data["resume"].get("projects", []):
                session.run("""
                    MERGE (p:Project {name: $name})
                    SET p.description = $desc
                    WITH p
                    MATCH (user:Person {name: $owner})
                    MERGE (user)-[:CREATED]->(p)
                    """,
                    name=prj["project_name"], desc=prj["description"], owner=final_data["Name"]
                )
            
            # From GitHub
            for repo in final_data["github"].get("repositories", []):
                session.run("""
                    MERGE (prj:Project {name: $name})
                    SET prj.description = $desc, prj.github_url = $url
                    WITH prj
                    MATCH (p:Person {name: $owner})
                    MERGE (p)-[:CREATED]->(prj)
                    """, 
                    name=repo["name"], desc=repo["description"], url=repo.get("html_url"),
                    owner=final_data["Name"]
                )
                for lang in repo.get("languages_used", []):
                    session.run("""
                        MERGE (s:Skill {name: $lang})
                        WITH s
                        MATCH (prj:Project {name: $name})
                        MERGE (prj)-[:USES_TECH]->(s)
                        """, 
                        lang=lang, name=repo["name"]
                    )
            logger.info("Full knowledge graph ingestion synchronized.")

        driver.close()
    except Exception as e:
        logger.error(f"Ingestion lifecycle failed: {e}")
