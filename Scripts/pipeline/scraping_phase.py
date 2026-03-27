import os
import time
import json
import logging
from google import genai
from github.github_scraper import fetch_github_repositories
from linkedin.linkedin_scraper import scrape_linkedin_profile
from resume.resume_parser import extract_resume_data

logger = logging.getLogger(__name__)

def format_with_gemini(data, prompt_type):
    """
    Generalized Gemini formatting function.
    """
    client = genai.Client(api_key=os.getenv('GOOGLE_API_KEY'))
    
    prompts = {
        "resume": "Format this resume text into a structured JSON with keys: Name, email, phone, location, linkedin_url, github_url, portfolio_url, summary, work_experience (list of objects with company_name, designation, location, start_date, end_date, description), education (list), projects (list), skills (list).",
        "linkedin": "Format this LinkedIn profile text into a structured JSON with keys: work_experience, education, certifications, honors_and_awards, skills.",
        "github": "Given this list of GitHub repositories and their readmes, extract a structured JSON focusing on project names, descriptions, and primary technologies used for each."
    }

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{prompts[prompt_type]}\n\nDATA:\n{data}",
        )
        # Clean up potential markdown
        json_str = response.text.strip().replace('```json', '').replace('```', '')
        return json.loads(json_str)
    except Exception as e:
        logger.error(f"Gemini formatting failed for {prompt_type}: {e}")
        return {}

def run_scraping_phase():
    """
    Fetch data from all sources and format it.
    """
    logger.info("Phase 1: Scraping and Formatting...")
    
    # 1. Fetch Raw Data
    resume_text = extract_resume_data('resources/Resume.pdf')
    linkedin_raw = scrape_linkedin_profile(os.getenv('LINKEDIN_URL'))
    github_raw = fetch_github_repositories(os.getenv('GITHUB_USERNAME'))
    
    # 2. Format with Gemini
    logger.info("Formatting data with Gemini...")
    final_data = {
        "Name": os.getenv('USER_NAME'),
        "email": os.getenv('USER_EMAIL'),
        "resume": format_with_gemini(resume_text, "resume"),
        "linkedin": format_with_gemini(json.dumps(linkedin_raw), "linkedin"),
        "github": {"repositories": format_with_gemini(json.dumps(github_raw), "github")}
    }
    
    # Save backup
    with open('final_data.json', 'w') as f:
        json.dump(final_data, f, indent=4)
    
    logger.info("Phase 1 completed. final_data.json updated.")
    return final_data
