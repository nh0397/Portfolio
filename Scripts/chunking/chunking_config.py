"""
Configuration file for sliding window chunking parameters.
Adjust these values based on your specific use case and requirements.
"""

# Chunking Parameters
CHUNKING_CONFIG = {
    # Token-based chunking parameters
    "chunk_size": 512,           # Maximum tokens per chunk
    "overlap_size": 50,          # Tokens to overlap between adjacent chunks
    
    # Model configuration for token counting
    "model_name": "gpt-3.5-turbo",  # Used for tiktoken tokenizer
    
    # Retrieval parameters
    "max_chunks_per_query": 5,   # Maximum number of chunks to retrieve per query
    "min_chunk_score": 0.7,      # Minimum similarity score for chunk retrieval
    
    # Rate limiting for API calls
    "embedding_delay": 1,        # Seconds to wait between embedding API calls
    
    # Chunk metadata settings
    "include_section_metadata": True,    # Include section identification in metadata
    "include_source_metadata": True,     # Include source type in metadata
    "include_chunk_index": True,         # Include chunk index in metadata
}

# Section identification keywords for metadata
SECTION_KEYWORDS = {
    "resume": {
        "work_experience": ["experience", "work", "employment", "career", "job", "position"],
        "education": ["education", "degree", "university", "college", "school", "academic"],
        "skills": ["skill", "technology", "programming", "technical", "proficiency"],
        "projects": ["project", "portfolio", "development", "built", "created"],
        "certifications": ["certification", "certificate", "license", "credential"]
    },
    "linkedin": {
        "work_experience": ["experience", "work", "employment", "career"],
        "education": ["education", "degree", "university", "college"],
        "skills": ["skill", "endorsement", "expertise", "competency"],
        "certifications": ["certification", "license", "credential"],
        "honors_awards": ["award", "honor", "achievement", "recognition"]
    },
    "github": {
        "repositories": ["repository", "repo", "project", "code"],
        "languages": ["language", "programming", "framework", "technology"],
        "descriptions": ["description", "readme", "documentation", "about"]
    }
}

# Chunking strategies - you can switch between these
CHUNKING_STRATEGIES = {
    "sliding_window": {
        "class": "SlidingWindowChunker",
        "description": "Fixed-size chunks with overlapping content",
        "pros": ["Maintains context", "Consistent chunk sizes", "Good for most use cases"],
        "cons": ["May split sentences", "Fixed size regardless of content"]
    },
    
    "semantic_chunking": {
        "class": "SemanticChunker",  # Would need to implement
        "description": "Chunks based on semantic boundaries",
        "pros": ["Respects content structure", "Better semantic coherence"],
        "cons": ["Variable chunk sizes", "More complex implementation"]
    },
    
    "hierarchical_chunking": {
        "class": "HierarchicalChunker",  # Would need to implement
        "description": "Multiple granularity levels",
        "pros": ["Flexible retrieval", "Multiple detail levels"],
        "cons": ["Complex storage", "More processing overhead"]
    }
}

# Current strategy (can be changed)
CURRENT_STRATEGY = "sliding_window"

def get_chunking_config():
    """Get the current chunking configuration."""
    return CHUNKING_CONFIG.copy()

def get_section_keywords():
    """Get section identification keywords."""
    return SECTION_KEYWORDS.copy()

def get_current_strategy():
    """Get the current chunking strategy configuration."""
    return CHUNKING_STRATEGIES[CURRENT_STRATEGY]

def update_chunking_config(**kwargs):
    """Update chunking configuration parameters."""
    global CHUNKING_CONFIG
    CHUNKING_CONFIG.update(kwargs)

def set_chunking_strategy(strategy_name):
    """Set the current chunking strategy."""
    global CURRENT_STRATEGY
    if strategy_name in CHUNKING_STRATEGIES:
        CURRENT_STRATEGY = strategy_name
    else:
        raise ValueError(f"Unknown strategy: {strategy_name}. Available: {list(CHUNKING_STRATEGIES.keys())}")
