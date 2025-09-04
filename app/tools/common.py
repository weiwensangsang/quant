from datetime import UTC
from datetime import datetime
import hashlib
import uuid


def generate_id() -> str:
    return str(uuid.uuid4())


def generate_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    return dt.strftime(fmt)


def parse_datetime(date_str: str, fmt: str = "%Y-%m-%d %H:%M:%S") -> datetime:
    return datetime.strptime(date_str, fmt).replace(tzinfo=UTC)
