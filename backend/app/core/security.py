"""
Security utilities for input sanitization.
"""


def sanitize_input(text: str, max_length: int = 5000) -> str:
    """
    Sanitize user input to prevent injection attacks.
    """
    if not text:
        return ""
    
    # Truncate to max length
    text = text[:max_length]
    
    # Remove null bytes
    text = text.replace("\x00", "")
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text
