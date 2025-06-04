"""
Simple in-memory cache for agent responses
"""
import time
import hashlib
import json
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

class CacheManager:
    """
    In-memory cache for agent responses with TTL
    """
    def __init__(self, default_ttl: int = 300):  # 5 minutes default
        self.cache: Dict[str, Tuple[Any, float]] = {}
        self.default_ttl = default_ttl
        self.hit_count = 0
        self.miss_count = 0
    
    def _generate_key(self, agent_type: str, message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Generate cache key from agent type, message and context"""
        cache_data = {
            "agent": agent_type,
            "message": message.lower().strip(),
            "context": context or {}
        }
        # Create a hash of the data
        cache_str = json.dumps(cache_data, sort_keys=True)
        return hashlib.md5(cache_str.encode()).hexdigest()
    
    def get(self, agent_type: str, message: str, context: Optional[Dict[str, Any]] = None) -> Optional[Any]:
        """Get cached response if available and not expired"""
        key = self._generate_key(agent_type, message, context)
        
        if key in self.cache:
            value, expiry_time = self.cache[key]
            if time.time() < expiry_time:
                self.hit_count += 1
                return value
            else:
                # Remove expired entry
                del self.cache[key]
        
        self.miss_count += 1
        return None
    
    def set(self, agent_type: str, message: str, value: Any, context: Optional[Dict[str, Any]] = None, ttl: Optional[int] = None) -> None:
        """Cache a response with TTL"""
        key = self._generate_key(agent_type, message, context)
        expiry_time = time.time() + (ttl or self.default_ttl)
        self.cache[key] = (value, expiry_time)
    
    def clear(self) -> None:
        """Clear all cached entries"""
        self.cache.clear()
        self.hit_count = 0
        self.miss_count = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hit_count + self.miss_count
        hit_rate = (self.hit_count / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "total_entries": len(self.cache),
            "hit_count": self.hit_count,
            "miss_count": self.miss_count,
            "hit_rate": f"{hit_rate:.1f}%",
            "total_requests": total_requests
        }
    
    def cleanup_expired(self) -> int:
        """Remove expired entries and return count of removed items"""
        current_time = time.time()
        expired_keys = [k for k, (_, exp) in self.cache.items() if exp < current_time]
        
        for key in expired_keys:
            del self.cache[key]
        
        return len(expired_keys)

# Global cache instance
response_cache = CacheManager(default_ttl=300)  # 5 minute cache