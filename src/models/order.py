from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from src.db.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")   # pending → preparing → ready
    total = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())

    # One order has many line items.
    # `back_populates` links both sides so they stay in sync.
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    # Foreign key: points to orders.id — ties this line to its order.
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)

    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)   # price captured at order time

    order = relationship("Order", back_populates="items")