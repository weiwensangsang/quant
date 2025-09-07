from datetime import datetime
from typing import Any

from pydantic import BaseModel
from pydantic import Field


class BaseRequest(BaseModel):
    pass


class BaseResponse(BaseModel):
    success: bool = Field(default=True)
    message: str | None = None
    data: Any | None = None
    timestamp: datetime = Field(default_factory=datetime.now)
