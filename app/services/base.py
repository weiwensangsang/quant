from abc import ABC
from abc import abstractmethod
from typing import Any

from app.core.logger import get_logger

logger = get_logger(__name__)


class BaseService(ABC):
    @abstractmethod
    async def execute(self, *args: Any, **kwargs: Any) -> Any:
        pass
