"""
Database type compatibility layer
Handles differences between PostgreSQL and SQLite
"""
from sqlalchemy import String, TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
import uuid


class UUID(TypeDecorator):
    """Platform-independent UUID type.
    
    Uses PostgreSQL's UUID type when available, 
    otherwise uses CHAR(36), storing as stringified hex values.
    """
    impl = CHAR(36)
    cache_ok = True
    
    def __init__(self, as_uuid=True):
        self.as_uuid = as_uuid
        super().__init__()

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgreSQLUUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            # For SQLite, always store as string
            if isinstance(value, uuid.UUID):
                return str(value)
            elif isinstance(value, str):
                # Validate it's a valid UUID string
                try:
                    uuid.UUID(value)
                    return value
                except ValueError:
                    raise ValueError(f"Invalid UUID string: {value}")
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            # For SQLite
            if self.as_uuid:
                if not isinstance(value, uuid.UUID):
                    if isinstance(value, int):
                        # Handle the case where SQLite might return an integer
                        return str(value)
                    else:
                        try:
                            return uuid.UUID(value)
                        except (ValueError, AttributeError):
                            return str(value)
                else:
                    return value
            else:
                # Return as string
                return str(value) if value else None

    @property
    def python_type(self):
        return uuid.UUID