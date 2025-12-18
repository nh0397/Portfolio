"""
Structured JSON Chunker - Creates semantic chunks preserving JSON structure.

This chunker creates one chunk per logical unit (work experience, project, repo, etc.)
instead of converting to text and splitting arbitrarily. This provides:
- Better semantic coherence
- Preserved structure for better querying
- More granular retrieval (one item per chunk)
"""

import json
from typing import List, Dict, Any


class StructuredChunker:
    """
    Creates structured chunks from JSON data by semantic units.
    Uses HYBRID approach: individual chunks + summary chunks for better context.
    """
    
    def __init__(self, include_summaries: bool = True):
        """
        Initialize the structured chunker.
        
        Args:
            include_summaries: If True, creates summary chunks in addition to individual chunks
        """
        self.include_summaries = include_summaries
    
    def chunk_resume(self, resume_data: Dict) -> List[Dict]:
        """
        Chunk resume data into semantic units with hybrid approach.
        
        Returns:
        - Individual chunks per work experience, project
        - Summary chunks for all work experiences, all projects
        - Skills and certifications chunks
        """
        chunks = []
        
        # Chunk 1: Basic Information
        if any(resume_data.get(k) for k in ['full_name', 'email_address', 'linkedin_url']):
            basic_info = {
                "chunk_type": "resume_basic_info",
                "content": {
                    "full_name": resume_data.get('full_name', ''),
                    "email_address": resume_data.get('email_address', ''),
                    "linkedin_url": resume_data.get('linkedin_url', '')
                },
                "chunk_text": self._format_basic_info(resume_data),
                "source_type": "resume",
                "section": "basic_info"
            }
            chunks.append(basic_info)
        
        # Individual chunks per work experience
        for idx, exp in enumerate(resume_data.get('work_experience', [])):
            work_chunk = {
                "chunk_type": "resume_work_experience",
                "content": exp,
                "chunk_text": self._format_work_experience(exp),
                "source_type": "resume",
                "section": "work_experience",
                "item_index": idx
            }
            chunks.append(work_chunk)
        
        # SUMMARY: All work experiences combined
        if self.include_summaries and resume_data.get('work_experience'):
            work_summary = {
                "chunk_type": "resume_work_experience_summary",
                "content": {
                    "all_experiences": resume_data['work_experience'],
                    "total_experiences": len(resume_data['work_experience'])
                },
                "chunk_text": self._format_work_experience_summary(resume_data['work_experience']),
                "source_type": "resume",
                "section": "work_experience_summary"
            }
            chunks.append(work_summary)
        
        # Individual chunks per project
        for idx, project in enumerate(resume_data.get('projects', [])):
            project_chunk = {
                "chunk_type": "resume_project",
                "content": project,
                "chunk_text": self._format_project(project),
                "source_type": "resume",
                "section": "projects",
                "item_index": idx
            }
            chunks.append(project_chunk)
        
        # SUMMARY: All projects combined
        if self.include_summaries and resume_data.get('projects'):
            projects_summary = {
                "chunk_type": "resume_projects_summary",
                "content": {
                    "all_projects": resume_data['projects'],
                    "total_projects": len(resume_data['projects'])
                },
                "chunk_text": self._format_projects_summary(resume_data['projects']),
                "source_type": "resume",
                "section": "projects_summary"
            }
            chunks.append(projects_summary)
        
        # Single chunk for all skills
        if resume_data.get('skills'):
            skills_chunk = {
                "chunk_type": "resume_skills",
                "content": {"skills": resume_data['skills']},
                "chunk_text": self._format_skills(resume_data['skills']),
                "source_type": "resume",
                "section": "skills"
            }
            chunks.append(skills_chunk)
        
        # Single chunk for certifications (if any)
        if resume_data.get('certifications'):
            cert_chunk = {
                "chunk_type": "resume_certifications",
                "content": {"certifications": resume_data['certifications']},
                "chunk_text": self._format_certifications(resume_data['certifications']),
                "source_type": "resume",
                "section": "certifications"
            }
            chunks.append(cert_chunk)
        
        return chunks
    
    def chunk_linkedin(self, linkedin_data: Dict) -> List[Dict]:
        """
        Chunk LinkedIn data into semantic units with hybrid approach.
        
        Returns individual chunks + summary chunks for better context.
        """
        chunks = []
        
        # Chunk 1: Basic Profile Information
        if any(linkedin_data.get(k) for k in ['full_name', 'headline', 'location']):
            basic_info = {
                "chunk_type": "linkedin_basic_info",
                "content": {
                    "full_name": linkedin_data.get('full_name', ''),
                    "headline": linkedin_data.get('headline', ''),
                    "location": linkedin_data.get('location', '')
                },
                "chunk_text": self._format_linkedin_basic_info(linkedin_data),
                "source_type": "linkedin",
                "section": "basic_info"
            }
            chunks.append(basic_info)
        
        # Individual chunks per work experience
        for idx, exp in enumerate(linkedin_data.get('work_experience', [])):
            work_chunk = {
                "chunk_type": "linkedin_work_experience",
                "content": exp,
                "chunk_text": self._format_work_experience(exp),
                "source_type": "linkedin",
                "section": "work_experience",
                "item_index": idx
            }
            chunks.append(work_chunk)
        
        # SUMMARY: All work experiences combined
        if self.include_summaries and linkedin_data.get('work_experience'):
            work_summary = {
                "chunk_type": "linkedin_work_experience_summary",
                "content": {
                    "all_experiences": linkedin_data['work_experience'],
                    "total_experiences": len(linkedin_data['work_experience'])
                },
                "chunk_text": self._format_work_experience_summary(linkedin_data['work_experience']),
                "source_type": "linkedin",
                "section": "work_experience_summary"
            }
            chunks.append(work_summary)
        
        # Individual chunks per education
        for idx, edu in enumerate(linkedin_data.get('education', [])):
            edu_chunk = {
                "chunk_type": "linkedin_education",
                "content": edu,
                "chunk_text": self._format_education(edu),
                "source_type": "linkedin",
                "section": "education",
                "item_index": idx
            }
            chunks.append(edu_chunk)
        
        # SUMMARY: All education combined
        if self.include_summaries and linkedin_data.get('education'):
            edu_summary = {
                "chunk_type": "linkedin_education_summary",
                "content": {
                    "all_education": linkedin_data['education'],
                    "total_degrees": len(linkedin_data['education'])
                },
                "chunk_text": self._format_education_summary(linkedin_data['education']),
                "source_type": "linkedin",
                "section": "education_summary"
            }
            chunks.append(edu_summary)
        
        # Single chunk for all skills
        if linkedin_data.get('skills'):
            skills_chunk = {
                "chunk_type": "linkedin_skills",
                "content": {"skills": linkedin_data['skills']},
                "chunk_text": self._format_skills(linkedin_data['skills']),
                "source_type": "linkedin",
                "section": "skills"
            }
            chunks.append(skills_chunk)
        
        # Individual chunks per certification
        for idx, cert in enumerate(linkedin_data.get('certifications', [])):
            cert_chunk = {
                "chunk_type": "linkedin_certification",
                "content": cert,
                "chunk_text": self._format_certification(cert),
                "source_type": "linkedin",
                "section": "certifications",
                "item_index": idx
            }
            chunks.append(cert_chunk)
        
        # SUMMARY: All certifications combined
        if self.include_summaries and linkedin_data.get('certifications'):
            cert_summary = {
                "chunk_type": "linkedin_certifications_summary",
                "content": {
                    "all_certifications": linkedin_data['certifications'],
                    "total_certifications": len(linkedin_data['certifications'])
                },
                "chunk_text": self._format_certifications_summary(linkedin_data['certifications']),
                "source_type": "linkedin",
                "section": "certifications_summary"
            }
            chunks.append(cert_summary)
        
        # Individual chunks per honor/award
        for idx, award in enumerate(linkedin_data.get('honors_and_awards', [])):
            award_chunk = {
                "chunk_type": "linkedin_honor_award",
                "content": award,
                "chunk_text": self._format_award(award),
                "source_type": "linkedin",
                "section": "honors_awards",
                "item_index": idx
            }
            chunks.append(award_chunk)
        
        # SUMMARY: All honors and awards combined
        if self.include_summaries and linkedin_data.get('honors_and_awards'):
            awards_summary = {
                "chunk_type": "linkedin_honors_awards_summary",
                "content": {
                    "all_awards": linkedin_data['honors_and_awards'],
                    "total_awards": len(linkedin_data['honors_and_awards'])
                },
                "chunk_text": self._format_awards_summary(linkedin_data['honors_and_awards']),
                "source_type": "linkedin",
                "section": "honors_awards_summary"
            }
            chunks.append(awards_summary)
        
        return chunks
    
    def chunk_github(self, github_data: Dict) -> List[Dict]:
        """
        Chunk GitHub data into semantic units with hybrid approach.
        
        Returns individual repo chunks + summary chunk for portfolio overview.
        """
        chunks = []
        
        # Individual chunks per repository
        for idx, repo in enumerate(github_data.get('repositories', [])):
            repo_chunk = {
                "chunk_type": "github_repository",
                "content": repo,
                "chunk_text": self._format_repository(repo),
                "source_type": "github",
                "section": "repositories",
                "item_index": idx
            }
            chunks.append(repo_chunk)
        
        # SUMMARY: All repositories overview
        if self.include_summaries and github_data.get('repositories'):
            repos_summary = {
                "chunk_type": "github_repositories_summary",
                "content": {
                    "all_repositories": github_data['repositories'],
                    "total_repositories": len(github_data['repositories'])
                },
                "chunk_text": self._format_repositories_summary(github_data['repositories']),
                "source_type": "github",
                "section": "repositories_summary"
            }
            chunks.append(repos_summary)
        
        return chunks
    
    # Formatting methods for chunk_text (used for embeddings)
    
    def _format_basic_info(self, data: Dict) -> str:
        """Format basic resume info as readable text."""
        parts = []
        if data.get('full_name'):
            parts.append(f"Name: {data['full_name']}")
        if data.get('email_address'):
            parts.append(f"Email: {data['email_address']}")
        if data.get('linkedin_url'):
            parts.append(f"LinkedIn: {data['linkedin_url']}")
        return ". ".join(parts) + "."
    
    def _format_linkedin_basic_info(self, data: Dict) -> str:
        """Format LinkedIn basic info as readable text."""
        parts = []
        if data.get('full_name'):
            parts.append(f"Name: {data['full_name']}")
        if data.get('headline'):
            parts.append(f"Headline: {data['headline']}")
        if data.get('location'):
            parts.append(f"Location: {data['location']}")
        return ". ".join(parts) + "."
    
    def _format_work_experience(self, exp: Dict) -> str:
        """Format work experience as readable text."""
        parts = []
        
        designation = exp.get('designation', '')
        company = exp.get('company_name', '')
        start = exp.get('start_date', '')
        end = exp.get('end_date', '')
        desc = exp.get('description', '')
        
        # Title line
        title = f"{designation} at {company}"
        if start and end:
            title += f" ({start} - {end})"
        parts.append(title)
        
        # Description
        if desc:
            parts.append(desc)
        
        return ". ".join(parts) + "."
    
    def _format_project(self, project: Dict) -> str:
        """Format project as readable text."""
        parts = []
        
        name = project.get('project_name', '')
        desc = project.get('description', '')
        
        if name:
            parts.append(f"Project: {name}")
        if desc:
            parts.append(desc)
        
        return ". ".join(parts) + "."
    
    def _format_skills(self, skills: List[str]) -> str:
        """Format skills list as readable text."""
        return f"Technical Skills: {', '.join(skills)}."
    
    def _format_certifications(self, certifications: List[str]) -> str:
        """Format certifications as readable text."""
        return f"Certifications: {', '.join(certifications)}."
    
    def _format_education(self, edu: Dict) -> str:
        """Format education as readable text."""
        parts = []
        
        degree = edu.get('degree', '')
        field = edu.get('field_of_study', '')
        institution = edu.get('institution_name', '')
        start = edu.get('start_date', '')
        end = edu.get('end_date', '')
        
        # Degree line
        edu_str = f"{degree} in {field}" if field else degree
        if institution:
            edu_str += f" from {institution}"
        if start and end:
            edu_str += f" ({start} - {end})"
        
        parts.append(edu_str)
        return ". ".join(parts) + "."
    
    def _format_certification(self, cert: Dict) -> str:
        """Format certification as readable text."""
        parts = []
        
        name = cert.get('certification_name', '')
        org = cert.get('issuing_organization', '')
        date = cert.get('issue_date', '')
        
        cert_str = name
        if org:
            cert_str += f" from {org}"
        if date:
            cert_str += f" (issued {date})"
        
        parts.append(f"Certification: {cert_str}")
        return ". ".join(parts) + "."
    
    def _format_award(self, award: Dict) -> str:
        """Format honor/award as readable text."""
        parts = []
        
        name = award.get('award_name', '')
        org = award.get('issuing_organization', '')
        date = award.get('issue_date', '')
        
        award_str = name
        if org:
            award_str += f" from {org}"
        if date:
            award_str += f" ({date})"
        
        parts.append(f"Award: {award_str}")
        return ". ".join(parts) + "."
    
    def _format_repository(self, repo: Dict) -> str:
        """Format GitHub repository as readable text."""
        parts = []
        
        name = repo.get('name', '')
        desc = repo.get('description', '')
        languages = repo.get('languages_used', [])
        created = repo.get('creation_date', '')
        updated = repo.get('last_updated', '')
        
        # Repository name and description
        repo_str = f"GitHub Repository: {name}"
        parts.append(repo_str)
        
        if desc:
            parts.append(f"Description: {desc}")
        
        if languages:
            parts.append(f"Technologies: {', '.join(languages)}")
        
        if created:
            parts.append(f"Created: {created}")
        
        if updated:
            parts.append(f"Last Updated: {updated}")
        
        return ". ".join(parts) + "."
    
    # ====================================================================
    # SUMMARY FORMATTING METHODS (for hybrid chunking)
    # ====================================================================
    
    def _format_work_experience_summary(self, experiences: List[Dict]) -> str:
        """Format all work experiences as a comprehensive summary."""
        parts = [f"Professional Work Experience Summary ({len(experiences)} positions):"]
        
        for i, exp in enumerate(experiences, 1):
            designation = exp.get('designation', '')
            company = exp.get('company_name', '')
            start = exp.get('start_date', '')
            end = exp.get('end_date', '')
            desc = exp.get('description', '')
            
            exp_str = f"{i}. {designation} at {company}"
            if start and end:
                exp_str += f" ({start} - {end})"
            if desc:
                exp_str += f": {desc}"
            
            parts.append(exp_str)
        
        return " ".join(parts)
    
    def _format_projects_summary(self, projects: List[Dict]) -> str:
        """Format all projects as a comprehensive summary."""
        parts = [f"Projects Portfolio ({len(projects)} projects):"]
        
        for i, project in enumerate(projects, 1):
            name = project.get('project_name', '')
            desc = project.get('description', '')
            
            proj_str = f"{i}. {name}"
            if desc:
                proj_str += f": {desc}"
            
            parts.append(proj_str)
        
        parts.append(f"Total: {len(projects)} completed projects demonstrating full-stack development, AI/ML integration, and automation expertise.")
        
        return " ".join(parts)
    
    def _format_education_summary(self, education: List[Dict]) -> str:
        """Format all education as a comprehensive summary."""
        parts = [f"Educational Background ({len(education)} degrees):"]
        
        for i, edu in enumerate(education, 1):
            degree = edu.get('degree', '')
            field = edu.get('field_of_study', '')
            institution = edu.get('institution_name', '')
            start = edu.get('start_date', '')
            end = edu.get('end_date', '')
            
            edu_str = f"{i}. {degree}"
            if field:
                edu_str += f" in {field}"
            if institution:
                edu_str += f" from {institution}"
            if start and end:
                edu_str += f" ({start} - {end})"
            
            parts.append(edu_str)
        
        return " ".join(parts)
    
    def _format_certifications_summary(self, certifications: List[Dict]) -> str:
        """Format all certifications as a comprehensive summary."""
        parts = [f"Professional Certifications ({len(certifications)} certifications):"]
        
        for i, cert in enumerate(certifications, 1):
            name = cert.get('certification_name', '')
            org = cert.get('issuing_organization', '')
            date = cert.get('issue_date', '')
            
            cert_str = f"{i}. {name}"
            if org:
                cert_str += f" from {org}"
            if date:
                cert_str += f" (issued {date})"
            
            parts.append(cert_str)
        
        return " ".join(parts)
    
    def _format_awards_summary(self, awards: List[Dict]) -> str:
        """Format all honors and awards as a comprehensive summary."""
        parts = [f"Honors and Awards ({len(awards)} awards):"]
        
        for i, award in enumerate(awards, 1):
            name = award.get('award_name', '')
            org = award.get('issuing_organization', '')
            date = award.get('issue_date', '')
            
            award_str = f"{i}. {name}"
            if org:
                award_str += f" from {org}"
            if date:
                award_str += f" ({date})"
            
            parts.append(award_str)
        
        return " ".join(parts)
    
    def _format_repositories_summary(self, repositories: List[Dict]) -> str:
        """Format all GitHub repositories as a comprehensive portfolio overview."""
        parts = [f"GitHub Portfolio Overview ({len(repositories)} repositories):"]
        
        # Collect all unique languages
        all_languages = set()
        for repo in repositories:
            langs = repo.get('languages_used', [])
            all_languages.update(langs)
        
        # Highlight key projects (non-empty descriptions)
        key_projects = [r for r in repositories if r.get('description')]
        
        parts.append("Key Projects:")
        for repo in key_projects[:10]:  # Top 10 projects with descriptions
            name = repo.get('name', '')
            desc = repo.get('description', '')
            parts.append(f"• {name}: {desc}")
        
        if all_languages:
            parts.append(f"Technologies used across portfolio: {', '.join(sorted(all_languages))}.")
        
        parts.append(f"Total: {len(repositories)} repositories demonstrating expertise in full-stack development, AI/ML, LLMs, RAG systems, and modern web technologies.")
        
        return " ".join(parts)

