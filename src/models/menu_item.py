from sqlalchemy import Column, Integer, String, Float, Boolean
from src.db.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"   # the actual SQL table name

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    price = Column(Float, nullable=False)
    category = Column(String(50))          # e.g. "pizza", "drink"
    available = Column(Boolean, default=True)
    image_url = Column(String(500))        # photo shown on the menu card