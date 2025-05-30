import logging
import sys
import os

def setup_logger(name: str) -> logging.Logger:
    """Set up logger with basic formatting"""
    logger = logging.getLogger(name)
    
    # Set log level from environment
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger.setLevel(getattr(logging, log_level))
    
    # Remove default handlers
    logger.handlers = []
    
    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    
    # Use basic formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger