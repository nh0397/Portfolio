import json
import tiktoken
from typing import List, Dict, Tuple
import re

class SlidingWindowChunker:
    """
    A sliding window chunker that splits text into overlapping chunks of fixed token size.
    Each chunk includes metadata about its position and source.
    """
    
    def __init__(self, 
                 chunk_size: int = 512, 
                 overlap_size: int = 50, 
                 model_name: str = "gpt-3.5-turbo"):
        """
        Initialize the chunker with configurable parameters.
        
        Args:
            chunk_size: Maximum number of tokens per chunk
            overlap_size: Number of tokens to overlap between adjacent chunks
            model_name: Model name for token counting (tiktoken)
        """
        self.chunk_size = chunk_size
        self.overlap_size = overlap_size
        self.model_name = model_name
        
        # Initialize tokenizer for accurate token counting
        try:
            self.tokenizer = tiktoken.encoding_for_model(model_name)
        except KeyError:
            # Fallback to cl100k_base encoding if model not found
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
    
    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.tokenizer.encode(text))
    
    def split_text_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences while preserving structure.
        This helps maintain semantic boundaries in chunks.
        """
        # Simple sentence splitting - can be improved with more sophisticated NLP
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def chunk_text(self, text: str, source_type: str, metadata: Dict = None) -> List[Dict]:
        """
        Split text into overlapping chunks with metadata.
        
        Args:
            text: The text to chunk
            source_type: Type of source (resume, linkedin, github)
            metadata: Additional metadata to include with each chunk
            
        Returns:
            List of chunk dictionaries with text, metadata, and embeddings
        """
        if not text or not text.strip():
            return []
        
        # Split into sentences for better semantic boundaries
        sentences = self.split_text_into_sentences(text)
        if not sentences:
            return []
        
        chunks = []
        current_chunk = []
        current_tokens = 0
        chunk_index = 0
        
        # Build chunks sentence by sentence
        for sentence in sentences:
            sentence_tokens = self.count_tokens(sentence)
            
            # If adding this sentence would exceed chunk size, finalize current chunk
            if current_tokens + sentence_tokens > self.chunk_size and current_chunk:
                # Create chunk from current sentences
                chunk_text = " ".join(current_chunk)
                chunk_data = self._create_chunk_data(
                    chunk_text, source_type, chunk_index, metadata
                )
                chunks.append(chunk_data)
                chunk_index += 1
                
                # Start new chunk with overlap
                current_chunk, current_tokens = self._create_overlap_chunk(
                    current_chunk, chunk_text
                )
            
            # Add current sentence to chunk
            current_chunk.append(sentence)
            current_tokens += sentence_tokens
        
        # Add the last chunk if it has content
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            chunk_data = self._create_chunk_data(
                chunk_text, source_type, chunk_index, metadata
            )
            chunks.append(chunk_data)
        
        return chunks
    
    def _create_overlap_chunk(self, previous_chunk: List[str], chunk_text: str) -> Tuple[List[str], int]:
        """
        Create overlap for the next chunk by taking the last portion of the current chunk.
        """
        if self.overlap_size <= 0:
            return [], 0
        
        # Split the chunk text into tokens for precise overlap
        tokens = self.tokenizer.encode(chunk_text)
        
        # Take the last overlap_size tokens
        overlap_tokens = tokens[-self.overlap_size:] if len(tokens) > self.overlap_size else tokens
        overlap_text = self.tokenizer.decode(overlap_tokens)
        
        # Try to split at sentence boundaries within the overlap
        overlap_sentences = self.split_text_into_sentences(overlap_text)
        
        return overlap_sentences, self.count_tokens(overlap_text)
    
    def _create_chunk_data(self, chunk_text: str, source_type: str, 
                          chunk_index: int, metadata: Dict = None) -> Dict:
        """
        Create a chunk data structure with metadata.
        """
        chunk_data = {
            "chunk_text": chunk_text,
            "source_type": source_type,
            "chunk_index": chunk_index,
            "token_count": self.count_tokens(chunk_text),
            "metadata": metadata or {}
        }
        
        # Add source-specific metadata
        if source_type == "resume":
            chunk_data["metadata"]["section"] = self._identify_resume_section(chunk_text)
        elif source_type == "linkedin":
            chunk_data["metadata"]["section"] = self._identify_linkedin_section(chunk_text)
        elif source_type == "github":
            chunk_data["metadata"]["section"] = self._identify_github_section(chunk_text)
        
        return chunk_data
    
    def _identify_resume_section(self, text: str) -> str:
        """Identify which section of the resume this chunk belongs to."""
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in ['experience', 'work', 'employment', 'career']):
            return 'work_experience'
        elif any(keyword in text_lower for keyword in ['education', 'degree', 'university', 'college']):
            return 'education'
        elif any(keyword in text_lower for keyword in ['skill', 'technology', 'programming']):
            return 'skills'
        elif any(keyword in text_lower for keyword in ['project', 'portfolio']):
            return 'projects'
        elif any(keyword in text_lower for keyword in ['certification', 'certificate']):
            return 'certifications'
        else:
            return 'general'
    
    def _identify_linkedin_section(self, text: str) -> str:
        """Identify which section of the LinkedIn profile this chunk belongs to."""
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in ['experience', 'work', 'employment']):
            return 'work_experience'
        elif any(keyword in text_lower for keyword in ['education', 'degree', 'university']):
            return 'education'
        elif any(keyword in text_lower for keyword in ['skill', 'endorsement']):
            return 'skills'
        elif any(keyword in text_lower for keyword in ['certification', 'license']):
            return 'certifications'
        elif any(keyword in text_lower for keyword in ['award', 'honor', 'achievement']):
            return 'honors_awards'
        else:
            return 'general'
    
    def _identify_github_section(self, text: str) -> str:
        """Identify which section of the GitHub data this chunk belongs to."""
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in ['repository', 'repo']):
            return 'repositories'
        elif any(keyword in text_lower for keyword in ['language', 'programming']):
            return 'languages'
        elif any(keyword in text_lower for keyword in ['description', 'readme']):
            return 'descriptions'
        else:
            return 'general'
    
    def chunk_json_data(self, json_data: Dict, source_type: str) -> List[Dict]:
        """
        Chunk JSON data by converting it to text and then chunking.
        
        Args:
            json_data: The JSON data to chunk
            source_type: Type of source (resume, linkedin, github)
            
        Returns:
            List of chunk dictionaries
        """
        # Convert JSON to readable text format
        text_data = self._json_to_text(json_data, source_type)
        
        # Create metadata from JSON structure
        metadata = {
            "original_json_keys": list(json_data.keys()) if isinstance(json_data, dict) else [],
            "source_type": source_type
        }
        
        return self.chunk_text(text_data, source_type, metadata)
    
    def _json_to_text(self, json_data: Dict, source_type: str) -> str:
        """
        Convert JSON data to readable text format for chunking.
        """
        if source_type == "resume":
            return self._resume_json_to_text(json_data)
        elif source_type == "linkedin":
            return self._linkedin_json_to_text(json_data)
        elif source_type == "github":
            return self._github_json_to_text(json_data)
        else:
            return json.dumps(json_data, indent=2)
    
    def _resume_json_to_text(self, resume_data: Dict) -> str:
        """Convert resume JSON to readable text."""
        text_parts = []
        
        # Basic info
        if resume_data.get('full_name'):
            text_parts.append(f"Name: {resume_data['full_name']}")
        if resume_data.get('email_address'):
            text_parts.append(f"Email: {resume_data['email_address']}")
        if resume_data.get('linkedin_url'):
            text_parts.append(f"LinkedIn: {resume_data['linkedin_url']}")
        
        # Work experience
        if resume_data.get('work_experience'):
            text_parts.append("\nWork Experience:")
            for exp in resume_data['work_experience']:
                exp_text = f"- {exp.get('designation', '')} at {exp.get('company_name', '')}"
                if exp.get('start_date') and exp.get('end_date'):
                    exp_text += f" ({exp['start_date']} - {exp['end_date']})"
                if exp.get('description'):
                    exp_text += f": {exp['description']}"
                text_parts.append(exp_text)
        
        # Skills
        if resume_data.get('skills'):
            text_parts.append(f"\nSkills: {', '.join(resume_data['skills'])}")
        
        # Projects
        if resume_data.get('projects'):
            text_parts.append("\nProjects:")
            for project in resume_data['projects']:
                proj_text = f"- {project.get('project_name', '')}"
                if project.get('description'):
                    proj_text += f": {project['description']}"
                text_parts.append(proj_text)
        
        # Certifications
        if resume_data.get('certifications'):
            text_parts.append(f"\nCertifications: {', '.join(resume_data['certifications'])}")
        
        return "\n".join(text_parts)
    
    def _linkedin_json_to_text(self, linkedin_data: Dict) -> str:
        """Convert LinkedIn JSON to readable text."""
        text_parts = []
        
        # Basic info
        if linkedin_data.get('full_name'):
            text_parts.append(f"Name: {linkedin_data['full_name']}")
        if linkedin_data.get('headline'):
            text_parts.append(f"Headline: {linkedin_data['headline']}")
        if linkedin_data.get('location'):
            text_parts.append(f"Location: {linkedin_data['location']}")
        
        # Work experience
        if linkedin_data.get('work_experience'):
            text_parts.append("\nWork Experience:")
            for exp in linkedin_data['work_experience']:
                exp_text = f"- {exp.get('designation', '')} at {exp.get('company_name', '')}"
                if exp.get('start_date') and exp.get('end_date'):
                    exp_text += f" ({exp['start_date']} - {exp['end_date']})"
                if exp.get('description'):
                    exp_text += f": {exp['description']}"
                text_parts.append(exp_text)
        
        # Education
        if linkedin_data.get('education'):
            text_parts.append("\nEducation:")
            for edu in linkedin_data['education']:
                edu_text = f"- {edu.get('degree', '')} in {edu.get('field_of_study', '')} from {edu.get('institution_name', '')}"
                if edu.get('start_date') and edu.get('end_date'):
                    edu_text += f" ({edu['start_date']} - {edu['end_date']})"
                text_parts.append(edu_text)
        
        # Skills
        if linkedin_data.get('skills'):
            text_parts.append(f"\nSkills: {', '.join(linkedin_data['skills'])}")
        
        # Certifications
        if linkedin_data.get('certifications'):
            text_parts.append("\nCertifications:")
            for cert in linkedin_data['certifications']:
                cert_text = f"- {cert.get('certification_name', '')} from {cert.get('issuing_organization', '')}"
                if cert.get('issue_date'):
                    cert_text += f" ({cert['issue_date']})"
                text_parts.append(cert_text)
        
        # Honors and awards
        if linkedin_data.get('honors_and_awards'):
            text_parts.append("\nHonors and Awards:")
            for award in linkedin_data['honors_and_awards']:
                award_text = f"- {award.get('award_name', '')} from {award.get('issuing_organization', '')}"
                if award.get('issue_date'):
                    award_text += f" ({award['issue_date']})"
                text_parts.append(award_text)
        
        return "\n".join(text_parts)
    
    def _github_json_to_text(self, github_data: Dict) -> str:
        """Convert GitHub JSON to readable text."""
        text_parts = []
        
        if github_data.get('repositories'):
            text_parts.append("GitHub Repositories:")
            for repo in github_data['repositories']:
                repo_text = f"- {repo.get('name', '')}"
                if repo.get('description'):
                    repo_text += f": {repo['description']}"
                if repo.get('languages_used'):
                    repo_text += f" (Languages: {', '.join(repo['languages_used'])})"
                if repo.get('creation_date'):
                    repo_text += f" (Created: {repo['creation_date']})"
                if repo.get('last_updated'):
                    repo_text += f" (Updated: {repo['last_updated']})"
                text_parts.append(repo_text)
        
        return "\n".join(text_parts)
