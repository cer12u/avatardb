from sqlmodel import SQLModel  # Removed create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

DATABASE_URL = "sqlite+aiosqlite:///./avatardb.db"

engine = create_async_engine(
    DATABASE_URL, echo=True, future=True, connect_args={"check_same_thread": False}
)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session
