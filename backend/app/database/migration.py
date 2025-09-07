import subprocess

from tortoise import Tortoise

from app.core.logger import get_logger

logger = get_logger("migration")


async def get_database_tables_count() -> int:
    connection = Tortoise.get_connection("default")
    result = await connection.execute_query(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
    )
    return result[1][0][0]


def aerich_init_db() -> bool:
    logger.info("Database init.")
    process = subprocess.run(
        ["aerich", "init-db"],
        check=False,
        capture_output=True,
        cwd=".",
        text=True,
    )
    logger.info(f"Return code: {process.returncode}")
    logger.info(f"Stdout: {process.stdout or 'None'}")
    logger.info(f"Stderr: {process.stderr or 'None'}")
    return process.returncode == 0


def auto_migrate() -> bool:
    process = subprocess.run(
        ["aerich", "upgrade"],
        check=False,
        capture_output=True,
        cwd=".",
        text=True,
    )
    if process.returncode == 0:
        output = process.stdout.strip() if process.stdout else ""
        if "No upgrade items found" in output:
            logger.info("✅ No pending migrations")
        else:
            logger.info(f"✅ Find pending migrations, 执行完毕: {output}")
        return True
    stderr_text = process.stderr or "Unknown error"
    logger.error(f"❌ migrations failed: {stderr_text}")
    return False
