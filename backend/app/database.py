import asyncpg
from app.config import settings

pool: asyncpg.Pool | None = None


async def connect_db():
    global pool
    pool = await asyncpg.create_pool(settings.DATABASE_URL, min_size=2, max_size=10)


async def close_db():
    global pool
    if pool:
        await pool.close()


async def get_db():
    async with pool.acquire() as conn:
        yield conn
