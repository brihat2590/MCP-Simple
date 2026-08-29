from src.db.database import get_session
from src.models.menu_item import MenuItem
from src.models.order import Order, OrderItem


def place_order(customer_name: str, items: list[dict]) -> dict:
    """
    Create an order.
    `items` = [{"menu_item_id": 1, "quantity": 2}, ...]
    Returns the created order as a dict.
    """
    with get_session() as s:
        order = Order(customer_name=customer_name, status="pending")

        total = 0.0
        for line in items:
            menu_item = s.get(MenuItem, line["menu_item_id"])
            if menu_item is None:
                raise ValueError(f"Menu item {line['menu_item_id']} not found")

            qty = line.get("quantity", 1)
            # Capture price at order time (menu prices can change later).
            order.items.append(OrderItem(
                menu_item_id=menu_item.id,
                quantity=qty,
                unit_price=menu_item.price,
            ))
            total += menu_item.price * qty

        order.total = round(total, 2)

        s.add(order)          # adding the order cascades to its items
        s.flush()             # forces INSERT now so order.id is populated

        return {
            "order_id": order.id,
            "customer_name": order.customer_name,
            "status": order.status,
            "total": order.total,
            "items": [
                {"menu_item_id": i.menu_item_id,
                 "quantity": i.quantity,
                 "unit_price": i.unit_price}
                for i in order.items
            ],
        }


def order_status(order_id: int) -> dict | None:
    """Look up an order's current status."""
    with get_session() as s:
        order = s.get(Order, order_id)
        if order is None:
            return None
        return {
            "order_id": order.id,
            "customer_name": order.customer_name,
            "status": order.status,
            "total": order.total,
        }