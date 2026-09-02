import os

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager

# Use PostgreSQL from env var, fall back to SQLite for local dev.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_1VfPrIt2idkY@ep-sparkling-scene-ae44qd7r-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require",  # noqa: E501
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=1,
    max_overflow=0,
    connect_args={"sslmode": "require"} if "postgresql" in DATABASE_URL else {},
    echo=False,
)

Base = declarative_base()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def init_db():
    from src.models import menu_item, order  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _run_migrations()


def _run_migrations():
    inspector = inspect(engine)
    if "menu_items" not in inspector.get_table_names():
        return
    columns = {col["name"] for col in inspector.get_columns("menu_items")}
    if "image_url" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE menu_items ADD COLUMN image_url VARCHAR(500)"))