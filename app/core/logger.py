import os
import sys
from typing import Any

from loguru import logger
import uvicorn.config


class LoggerManager:
    _instance: "LoggerManager | None" = None
    _initialized: bool = False

    def __new__(cls) -> "LoggerManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if not self._initialized:
            LoggerManager._setup_logger()
            self._initialized = True

    @staticmethod
    def _setup_logger() -> None:
        logger.remove()
        log_level = os.getenv("LOG_LEVEL", "INFO").upper()
        logger.add(
            sys.stdout,
            level=log_level,
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>",
            colorize=True,
        )
        log_file = os.getenv("LOG_FILE")
        if log_file:
            logger.add(
                log_file,
                level=log_level,
                format="{time:YYYY-MM-DD HH:mm:ss.SSS} | "
                "{level: <8} | "
                "{name}:{line} | "
                "{message}",
                rotation="10 MB",
                retention="1 week",
                compression="zip",
            )

    @classmethod
    def get_logger(cls, name: str | None = None) -> Any:
        if cls._instance is None:
            cls._instance = cls()
        if name:
            return logger.bind(name=name)
        return logger

    @classmethod
    def set_level(cls, level: str) -> None:
        logger.remove()
        cls._instance = None
        cls._initialized = False
        os.environ["LOG_LEVEL"] = level.upper()
        cls()


def get_logger(name: str | None = None) -> Any:
    return LoggerManager.get_logger(name)


def set_log_level(level: str) -> None:
    LoggerManager.set_level(level)


def get_uvicorn_log_config() -> dict[str, Any]:
    log_config = uvicorn.config.LOGGING_CONFIG.copy()
    uvicorn_level = os.getenv("UVICORN_LOG_LEVEL", "WARNING")
    access_level = os.getenv("UVICORN_ACCESS_LOG_LEVEL", "ERROR")
    log_config["loggers"]["uvicorn"]["level"] = uvicorn_level
    log_config["loggers"]["uvicorn.access"]["level"] = access_level
    return log_config
