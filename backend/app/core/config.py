import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Quant System"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    work_dir: str = "./workspace"

    database_host: str = "localhost"
    database_port: int = 5432
    database_user: str = "postgres"
    database_password: str = ""
    database_name: str = "quant_db"

    @property
    def database_url(self) -> str:
        password_part = f":{self.database_password}" if self.database_password else ""
        return f"postgresql://{self.database_user}{password_part}@{self.database_host}:{self.database_port}/{self.database_name}"

    class Config:
        env_file_encoding = "utf-8"


def load_settings() -> Settings:
    env = os.getenv("ENVIRONMENT", "dev")
    env_file = f"env.{env}"
    if not Path(env_file).exists():
        env_file = "env.dev"
    load_dotenv(env_file)
    return Settings()


settings = load_settings()
