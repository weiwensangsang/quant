from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise import Tortoise
import uvicorn

from app.api.routes import health
from app.core.config import settings
from app.core.logger import get_logger
from app.database.config import get_tortoise_config
from app.database.migration import aerich_init_db
from app.database.migration import auto_migrate
from app.database.migration import get_database_tables_count

logger = get_logger("main")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await Tortoise.init(config=get_tortoise_config())
    auto_migrate()
    tables_count = await get_database_tables_count()
    logger.info(f"当前数据库表数量: {tables_count}")
    if tables_count == 0:
        logger.info("初始化数据库...")
        aerich_init_db()
        auto_migrate()

    logger.info(f"📖 Swagger UI: http://localhost:{settings.api_port}/docs")
    yield
    logger.info("🧹 清理资源...")
    await Tortoise.close_connections()


def create_app() -> FastAPI:
    app = FastAPI(
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health.router, prefix="/api", tags=["health"])
    return app


app = create_app()
if __name__ == "__main__":
    import logging
    import os

    from app.core.logger import set_log_level

    log_level = os.getenv("LOG_LEVEL", "info")
    set_log_level(log_level)

    logging.getLogger("uvicorn.access").disabled = True
    logging.getLogger("uvicorn.access").setLevel(logging.CRITICAL)
    logging.getLogger("uvicorn.access").propagate = False
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("tortoise").setLevel(logging.WARNING)
    logging.getLogger("asyncpg").setLevel(logging.WARNING)

    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        reload_dirs=["app/"],
        log_level=log_level,
        access_log=False,
        use_colors=True,
    )
