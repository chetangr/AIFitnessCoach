import re
from typing import Optional

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> bool:
    """
    Validate password strength
    Requirements:
    - At least 8 characters long
    - Contains uppercase letter
    - Contains lowercase letter
    - Contains number
    - Contains special character
    """
    if len(password) < 8:
        return False
    
    # Check for uppercase
    if not re.search(r'[A-Z]', password):
        return False
    
    # Check for lowercase
    if not re.search(r'[a-z]', password):
        return False
    
    # Check for number
    if not re.search(r'\d', password):
        return False
    
    # Check for special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False
    
    return True

def validate_username(username: str) -> bool:
    """
    Validate username
    Requirements:
    - 3-50 characters long
    - Alphanumeric with underscores only
    - Cannot start with number
    """
    if not 3 <= len(username) <= 50:
        return False
    
    pattern = r'^[a-zA-Z][a-zA-Z0-9_]*$'
    return bool(re.match(pattern, username))