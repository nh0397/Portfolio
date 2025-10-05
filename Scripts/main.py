#!/usr/bin/env python3
"""
Portfolio RAG System - Data Processing Script

This script's ONLY job:
1. Read latest data from GitHub, LinkedIn, and Resume
2. Chunk the data with sliding window strategy
3. Create embeddings using Google Gemini
4. Write everything to MongoDB vector database

That's it. No server, no API, just data processing.
"""

import os
import json
import time
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
from google import genai

# Import from folders
from linkedin.linkedin_scraper import scrape_linkedin_profile
from github.github_scraper import fetch_github_repositories
from resume.resume_parser import extract_resume_data
from chunking.text_chunker import SlidingWindowChunker
from chunking.chunking_config import get_chunking_config

# Load environment variables
load_dotenv()

# Set up Gemini API key
GEMINI_API_KEY = os.getenv('GOOGLE_API_KEY')


class GoogleEmbeddings:
    """Google Embeddings class for generating embeddings using Gemini API."""
    
    def __init__(self, model_name: str = "models/embedding-001") -> None:
        self.model_name = model_name
        self.client = genai.Client(api_key=GEMINI_API_KEY)

    def generate_embeddings(self, inp: str) -> np.ndarray:
        """Generate embeddings for input text."""
        if not GEMINI_API_KEY:
            print("Please set correct Google API key")
            return []

        try:
            result = self.client.models.embed_content(
                model="gemini-embedding-001",
                contents=inp
            )
            # Extract embedding values from the first embedding in the list
            embds = list(result.embeddings[0].values)
        except Exception as e:
            print(f"Embeddings not found: {e}")
            return []

        return embds


def format_resume_with_gemini(resume_data):
    """Format resume data using Gemini AI."""
    prompt = '''
    Given the following parsed resume data, extract and organize the information into a structured JSON format. The JSON should include the following fields:
    1. "full_name": The full name of the candidate.
    2. "email_address": The candidate's email address.
    3. "linkedin_url": The URL of the candidate's LinkedIn profile.
    4. "work_experience": A list of dictionaries.
    5. "skills": An array of skills listed in the resume.
    6. "projects": A list of dictionaries.
    7. "certifications": An array of certifications listed in the resume.

    Ensure that all extracted information is accurately formatted.

    Here is the parsed resume data:
    {resume_data}

    Return the output in the following JSON format:
    {{
      "full_name": "string",
      "email_address": "string",
      "linkedin_url": "string",
      "work_experience": [
        {{
          "company_name": "string",
          "designation": "string",
          "description": "string",
          "start_date": "string",
          "end_date": "string"
        }},
        ...
      ],
      "skills": [
        "string",
        ...
      ],
      "projects": [
        {{
          "project_name": "string",
          "description": "string"
        }},
        ...
      ],
      "certifications": [
        "string",
        ...
      ]
    }}
    '''

    formatted_prompt = prompt.format(resume_data=json.dumps(resume_data, indent=4))
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=formatted_prompt,
    )
    json_text = response.text.replace('```json\n', '').replace('```', '').strip()
    formatted_resume_data = json.loads(json_text)
    return formatted_resume_data


def format_linkedin_with_gemini(linkedin_data):
    """Format LinkedIn data using Gemini AI."""
    prompt = '''
    Given the following parsed LinkedIn profile data, extract and organize the information into a structured JSON format. The JSON should include the following fields:
    1. "full_name": The full name of the profile owner.
    2. "headline": The headline or current designation.
    3. "location": The current location of the profile owner.
    4. "work_experience": A list of dictionaries.
    5. "education": A list of dictionaries.
    6. "skills": An array of skills listed in the LinkedIn profile.
    7. "certifications": A list of certifications.
    8. "honors_and_awards": A list of honors and awards.

    Ensure that all extracted information is accurately formatted.

    Here is the parsed LinkedIn profile data:
    {linkedin_data}

    Return the output in the following JSON format:
    {{
      "full_name": "string",
      "headline": "string",
      "location": "string",
      "work_experience": [
        {{
          "company_name": "string",
          "designation": "string",
          "description": "string",
          "start_date": "string",
          "end_date": "string"
        }},
        ...
      ],
      "education": [
        {{
          "institution_name": "string",
          "degree": "string",
          "field_of_study": "string",
          "start_date": "string",
          "end_date": "string"
        }},
        ...
      ],
      "skills": [
        "string",
        ...
      ],
      "certifications": [
        {{
          "certification_name": "string",
          "issuing_organization": "string",
          "issue_date": "string"
        }},
        ...
      ],
      "honors_and_awards": [
        {{
          "award_name": "string",
          "issuing_organization": "string",
          "issue_date": "string"
        }},
        ...
      ]
    }}
    '''

    formatted_prompt = prompt.format(linkedin_data=json.dumps(linkedin_data, indent=4))
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=formatted_prompt,
    )
    json_text = response.text.replace('```json\n', '').replace('```', '').strip()
    formatted_linkedin_data = json.loads(json_text)
    return formatted_linkedin_data


def format_github_with_gemini(github_data):
    """Format GitHub data using Gemini AI."""
    prompt = '''
    Given the following parsed GitHub repositories data, extract and organize the information into a structured JSON format. The JSON should include the following fields:
    1. "repositories": A list of repositories, each containing:
       - "name": The name of the repository.
       - "description": The description of the repository. Extract it meaningfully from the readme of the input data I am providing below.
       - "languages_used": An array of languages used in the repository Extract it meaningfully from the readme of the input data I am providing below.
       - "creation_date": The date the repository was created.
       - "last_updated": The date the repository was last updated.

    Ensure that all extracted information is accurately formatted.

    Here is the parsed GitHub repositories data:
    {github_data}

    Return the output in the following JSON format:
    {{
      "repositories": [
        {{
          "name": "string",
          "description": "string",
          "languages_used": ["string", ...],
          "creation_date": "string",
          "last_updated": "string"
        }},
        ...
      ]
    }}
    '''

    formatted_prompt = prompt.format(github_data=json.dumps(github_data, indent=4))
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=formatted_prompt,
    )
    json_text = response.text.replace('```json\n', '').replace('```', '').strip()
    formatted_github_data = json.loads(json_text)
    return formatted_github_data


def main():
    """
    Main function that does ONE JOB:
    Read latest data → Chunk → Create embeddings → Write to vector database
    """
    print("🚀 Portfolio RAG Data Processing Script")
    print("=" * 50)
    print("Job: Read data → Chunk → Embed → Store in vector DB")
    print("=" * 50)
    
    # Get user data from environment variables
    user_data = {
        "name": os.getenv('USER_NAME'),
        "email": os.getenv('USER_EMAIL'),
        "github_username": os.getenv('GITHUB_USERNAME'),
        "linkedin_url": os.getenv('LINKEDIN_URL')
    }
    
    print("📊 User Data:")
    for key, value in user_data.items():
        print(f"   {key}: {value}")
    
    # Step 1: Read latest data from all sources
    print("\n📖 Step 1: Reading latest data from sources...")
    
    print("   📂 Fetching latest GitHub repositories...")
    github_projects = fetch_github_repositories(user_data['github_username'])
    print(f"   ✅ Found {len(github_projects) if github_projects else 0} GitHub repositories")
    
    print("   🔗 Scraping latest LinkedIn profile...")
    linkedin_data = scrape_linkedin_profile(user_data['linkedin_url'])
    print("   ✅ LinkedIn profile scraped")
    
    print("   📄 Parsing resume...")
    resume_data = extract_resume_data("./resources/Resume.pdf")
    print("   ✅ Resume parsed")
    
    # Step 2: Format data using Gemini AI
    print("\n🤖 Step 2: Formatting data with Gemini AI...")
    
    print("   📝 Formatting resume data...")
    time.sleep(10)  # Rate limiting
    formatted_resume_data = format_resume_with_gemini(resume_data)
    print("   ✅ Resume data formatted")
    
    print("   🔗 Formatting LinkedIn data...")
    time.sleep(10)  # Rate limiting
    formatted_linkedin_data = format_linkedin_with_gemini(linkedin_data)
    print("   ✅ LinkedIn data formatted")
    
    print("   📂 Formatting GitHub data...")
    time.sleep(10)  # Rate limiting
    formatted_github_data = format_github_with_gemini(github_projects)
    print("   ✅ GitHub data formatted")
    
    # Step 3: Combine all data
    print("\n📋 Step 3: Combining all data...")
    final_data = {
        "Name": user_data['name'],
        "email": user_data['email'],
        "linkedinURL": user_data['linkedin_url'],
        "githubURL": f"https://github.com/{user_data['github_username']}",
        "resume": formatted_resume_data,
        "github": formatted_github_data,
        "linkedin": formatted_linkedin_data
    }
    
    # Step 4: Setup chunking system
    print("\n🔪 Step 4: Setting up chunking system...")
    google_embeddings = GoogleEmbeddings()
    config = get_chunking_config()
    
    chunker = SlidingWindowChunker(
        chunk_size=config["chunk_size"],
        overlap_size=config["overlap_size"],
        model_name=config["model_name"]
    )
    
    print(f"   📏 Chunk size: {config['chunk_size']} tokens")
    print(f"   🔄 Overlap size: {config['overlap_size']} tokens")
    
    # Step 5: Chunk the data
    print("\n✂️ Step 5: Chunking data with sliding window...")
    
    resume_chunks = chunker.chunk_json_data(final_data["resume"], "resume")
    linkedin_chunks = chunker.chunk_json_data(final_data["linkedin"], "linkedin")
    github_chunks = chunker.chunk_json_data(final_data["github"], "github")
    
    print(f"   📄 Created {len(resume_chunks)} resume chunks")
    print(f"   🔗 Created {len(linkedin_chunks)} LinkedIn chunks")
    print(f"   📂 Created {len(github_chunks)} GitHub chunks")
    
    # Step 6: Create embeddings for each chunk
    print("\n🔮 Step 6: Creating embeddings for chunks...")
    
    all_chunks = []
    
    # Process resume chunks
    for i, chunk in enumerate(resume_chunks):
        print(f"   📝 Creating embedding for resume chunk {i+1}/{len(resume_chunks)}")
        chunk_embedding = google_embeddings.generate_embeddings(chunk["chunk_text"])
        chunk["embedding"] = chunk_embedding
        chunk["source_type"] = "resume"
        all_chunks.append(chunk)
        time.sleep(config["embedding_delay"])
    
    # Process LinkedIn chunks
    for i, chunk in enumerate(linkedin_chunks):
        print(f"   🔗 Creating embedding for LinkedIn chunk {i+1}/{len(linkedin_chunks)}")
        chunk_embedding = google_embeddings.generate_embeddings(chunk["chunk_text"])
        chunk["embedding"] = chunk_embedding
        chunk["source_type"] = "linkedin"
        all_chunks.append(chunk)
        time.sleep(config["embedding_delay"])
    
    # Process GitHub chunks
    for i, chunk in enumerate(github_chunks):
        print(f"   📂 Creating embedding for GitHub chunk {i+1}/{len(github_chunks)}")
        chunk_embedding = google_embeddings.generate_embeddings(chunk["chunk_text"])
        chunk["embedding"] = chunk_embedding
        chunk["source_type"] = "github"
        all_chunks.append(chunk)
        time.sleep(config["embedding_delay"])
    
    # Step 7: Write to MongoDB vector database
    print("\n💾 Step 7: Writing chunks to MongoDB vector database...")
    
    from urllib.parse import quote_plus
    user_name = quote_plus(os.getenv('MONGO_USERNAME'))
    password = quote_plus(os.getenv('MONGO_PASSWORD'))
    MONGO_URI = f"mongodb+srv://{user_name}:{password}@personal-data-extractor.5kfcs.mongodb.net/?retryWrites=true&w=majority&appName=personal-data-extractor"
    
    client = MongoClient(MONGO_URI)
    db = client[os.getenv('MONGO_DB_NAME')][os.getenv('MONGO_CL_NAME')]
    
    # Clear existing data and insert new chunks
    db.drop()
    db.insert_many(all_chunks)
    
    print(f"   ✅ Written {len(all_chunks)} chunks to MongoDB vector database")
    print(f"   📊 Database: {os.getenv('MONGO_DB_NAME')}")
    print(f"   📁 Collection: {os.getenv('MONGO_CL_NAME')}")
    
    # Step 8: Save final data as backup
    print("\n💾 Step 8: Saving final data as backup...")
    with open('final_data.json', 'w') as f:
        json.dump(final_data, f, indent=4)
    
    print("   ✅ Final data saved to final_data.json")
    
    # Summary
    print("\n🎉 Data processing completed successfully!")
    print("=" * 50)
    print(f"📊 Summary:")
    print(f"   - Resume chunks: {len(resume_chunks)}")
    print(f"   - LinkedIn chunks: {len(linkedin_chunks)}")
    print(f"   - GitHub chunks: {len(github_chunks)}")
    print(f"   - Total chunks: {len(all_chunks)}")
    print(f"   - MongoDB vector database: Updated!")
    
    print("\n✅ Script completed - Vector database is ready for your chatbot!")


if __name__ == "__main__":
    main()