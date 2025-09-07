from abc import ABC
from abc import abstractmethod

from app.core.logger import get_logger

logger = get_logger(__name__)


class BaseManager(ABC):
    @abstractmethod
    async def initialize(self) -> None:
        pass

    @abstractmethod
    async def cleanup(self) -> None:
        pass
