from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager

# 1. The engine — how we talk to SQLite.
#    "sqlite:///restaurant.db" = a file named restaurant.db in the project root.
DATABASE_URL = "sqlite:///restaurant.db"

engine = create_engine(
    DATABASE_URL,
    # SQLite-only: allows the connection to be used across threads.
    connect_args={"check_same_thread": False},
    echo=True,  # prints the SQL it runs — great for learning; turn off later.
)

# 2. Base — every model class inherits from this.
#    SQLAlchemy uses it to collect table definitions.
Base = declarative_base()

# 3. SessionLocal — a factory that produces Session objects.
#    You create one session per unit of work, then close it.
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        # Writes made through this session (adds, flushes) only stick around
        # if we commit — without this, every place_order() silently rolled
        # back on session.close() and orders never persisted.
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

# 4. Helper to create all tables from your models.
def init_db():
    # Import models here so Base "knows" about them before creating tables.
    from src.models import menu_item, order  # noqa: F401
    Base.metadata.create_all(bind=engine)
    _run_migrations()


def _run_migrations():
    """Lightweight in-place migrations for columns added after the db
    file already existed (SQLite has no ALTER-based auto-migration)."""
    inspector = inspect(engine)
    if "menu_items" not in inspector.get_table_names():
        return
    columns = {col["name"] for col in inspector.get_columns("menu_items")}
    if "image_url" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE menu_items ADD COLUMN image_url VARCHAR(500)"))