from sqlalchemy import create_engine
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
    finally:
        session.close()

# 4. Helper to create all tables from your models.
def init_db():
    # Import models here so Base "knows" about them before creating tables.
    from src.models import menu_item, order  # noqa: F401
    Base.metadata.create_all(bind=engine)