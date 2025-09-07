from __future__ import annotations

from dataclasses import dataclass
from dataclasses import field
from enum import StrEnum
from typing import Any


class Status(StrEnum):
    IDLE = "idle"
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"
    CANCELLED = "cancelled"


@dataclass
class BaseState:
    id: str
    status: str
    error_message: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
