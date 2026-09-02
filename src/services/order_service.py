import os
from datetime import datetime, timezone

from src.db.database import get_session
from src.models.menu_item import MenuItem
from src.models.order import Order, OrderItem

# ---------------------------------------------------------------------------
# Order lifecycle timing.
#
# Orders advance on a timer without any background job or scheduler: the stage
# is *derived* from how long ago the order was placed (`created_at`) every time
# it is read. An order goes  pending -> preparing -> ready.  "ready" means the
# kitchen is done — the order is complete. Tune the two thresholds (in seconds)
# with the ORDER_PREPARING_AFTER_SECONDS / ORDER_READY_AFTER_SECONDS env vars.
# ---------------------------------------------------------------------------
PREPARING_AFTER_SECONDS = int(os.getenv("ORDER_PREPARING_AFTER_SECONDS", "60"))
READY_AFTER_SECONDS = int(os.getenv("ORDER_READY_AFTER_SECONDS", "300"))

# Statuses that are set explicitly (e.g. a future "cancel" action) and must
# never be overridden by the timer.
_MANUAL_STATUSES = {"cancelled", "completed"}


def _utcnow() -> datetime:
    # `created_at` is stored as naive UTC (SQLite CURRENT_TIMESTAMP), so compare
    # against a naive UTC clock.
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _elapsed_seconds(order: Order) -> float | None:
    if order.created_at is None:
        return None
    return (_utcnow() - order.created_at).total_seconds()


def _derive_status(order: Order) -> str:
    """Compute an order's live stage from the time elapsed since it was placed."""
    if order.status in _MANUAL_STATUSES:
        return order.status
    elapsed = _elapsed_seconds(order)
    if elapsed is None:
        return order.status or "pending"
    if elapsed >= READY_AFTER_SECONDS:
        return "ready"
    if elapsed >= PREPARING_AFTER_SECONDS:
        return "preparing"
    return "pending"


def _seconds_until_ready(order: Order) -> int | None:
    """Whole seconds until the order reaches "ready" (0 once it's ready)."""
    elapsed = _elapsed_seconds(order)
    if elapsed is None:
        return None
    return max(0, round(READY_AFTER_SECONDS - elapsed))


def place_order(customer_name: str, items: list[dict]) -> dict:
    """
    Create an order.
    `items` = [{"menu_item_id": 1, "quantity": 2}, ...]
    Returns the created order as a dict.
    """
    with get_session() as s:
        order = Order(customer_name=customer_name, status="pending")

        total = 0.0
        line_names: dict[int, str] = {}
        for line in items:
            menu_item = s.get(MenuItem, line["menu_item_id"])
            if menu_item is None:
                raise ValueError(f"Menu item {line['menu_item_id']} not found")

            qty = line.get("quantity", 1)
            line_names[menu_item.id] = menu_item.name
            # Capture price at order time (menu prices can change later).
            order.items.append(OrderItem(
                menu_item_id=menu_item.id,
                quantity=qty,
                unit_price=menu_item.price,
            ))
            total += menu_item.price * qty

        order.total = round(total, 2)

        s.add(order)          # adding the order cascades to its items
        s.flush()   

                  # forces INSERT now so order.id is populated

        print("The order has been created through MCP")

        return {
            "order_id": order.id,
            "customer_name": order.customer_name,
            "status": _derive_status(order),
            "eta_seconds": _seconds_until_ready(order),
            "total": order.total,
            "items": [
                {"menu_item_id": i.menu_item_id,
                 "name": line_names.get(i.menu_item_id, "Unknown item"),
                 "quantity": i.quantity,
                 "unit_price": i.unit_price}
                for i in order.items
            ],
        }


def order_status(order_id: int) -> dict | None:
    """Look up an order's current (time-derived) status."""
    with get_session() as s:
        order = s.get(Order, order_id)
        if order is None:
            return None
        status = _derive_status(order)
        return {
            "order_id": order.id,
            "customer_name": order.customer_name,
            "status": status,
            "eta_seconds": 0 if status == "ready" else _seconds_until_ready(order),
            "total": order.total,
        }


def _item_dict(s, i: OrderItem) -> dict:
    menu_item = s.get(MenuItem, i.menu_item_id)
    return {
        "menu_item_id": i.menu_item_id,
        "name": menu_item.name if menu_item else "Unknown item",
        "quantity": i.quantity,
        "unit_price": i.unit_price,
    }


def list_orders() -> list[dict]:
    """Return every order, newest first, each with its line items."""
    with get_session() as s:
        orders = s.query(Order).order_by(Order.id.desc()).all()
        return [
            {
                "order_id": o.id,
                "customer_name": o.customer_name,
                "status": _derive_status(o),
                "eta_seconds": _seconds_until_ready(o),
                "total": o.total,
                "items": [_item_dict(s, i) for i in o.items],
            }
            for o in orders
        ]


def list_pending_orders() -> list[dict]:
    """Return the orders still being handled by the kitchen — i.e. not yet
    "ready" — newest first. Each entry leads with `customer_name`: active
    orders should always be identified to the customer by name, never by order
    id. Orders advance on a timer (pending -> preparing -> ready); once an order
    is ready it is complete and drops off this list. Each entry also carries its
    live `status` and `eta_seconds` (seconds until it is ready).
    """
    with get_session() as s:
        orders = s.query(Order).order_by(Order.id.desc()).all()
        result: list[dict] = []
        for o in orders:
            status = _derive_status(o)
            if status not in ("pending", "preparing"):
                continue
            result.append({
                "customer_name": o.customer_name,
                "status": status,
                "eta_seconds": _seconds_until_ready(o),
                "total": o.total,
                "items": [_item_dict(s, i) for i in o.items],
            })
        return result