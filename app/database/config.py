import os
from typing import Any


def get_tortoise_config() -> dict[str, Any]:
    return {
        "connections": {
            "default": {
                "engine": "tortoise.backends.asyncpg",
                "credentials": {
                    "host": os.getenv("DATABASE_HOST", "localhost"),
                    "port": int(os.getenv("DATABASE_PORT", "5432")),
                    "user": os.getenv("DATABASE_USER", "postgres"),
                    "password": os.getenv("DATABASE_PASSWORD", ""),
                    "database": os.getenv("DATABASE_NAME", "quant_db"),
                },
            }
        },
        "apps": {
            "models": {
                "models": ["app.entities", "aerich.models"],
                "default_connection": "default",
            }
        },
        "use_tz": True,
        "timezone": "UTC",
    }


TORTOISE_ORM = get_tortoise_config()
