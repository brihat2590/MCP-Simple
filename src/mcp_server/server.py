from mcp.server import MCPServer

from src.services.menu_service import get_menu as _get_menu
from src.services.order_service import (
    place_order as _place_order,
    order_status as _order_status,
    list_orders as _list_orders,
    list_pending_orders as _list_pending_orders,
)
from src.services.weather_service import get_weather as _get_weather

mcp = MCPServer("restaurant")


@mcp.tool()
def get_menu(category: str | None = None) -> list[dict]:
    """Get the restaurant menu.

    Args:
        category: Optional filter, e.g. "pizza", "salad", "drink", "dessert".
                  Omit to return the full menu.
    """
    return _get_menu(category)


@mcp.tool()
def place_order(customer_name: str, items: list[dict]) -> dict:
    """Place a food order.

    Args:
        customer_name: The name of the customer.
        items: List of items to order, each like
               {"menu_item_id": 1, "quantity": 2}.
    """
    return _place_order(customer_name, items)


@mcp.tool()
def order_status(order_id: int) -> dict:
    """Check the status of an existing order.

    Orders advance on a timer: pending -> preparing -> ready ("ready" means the
    order is complete). The returned `status` is the live stage and
    `eta_seconds` is how long until it is ready.

    Args:
        order_id: The id returned when the order was placed.
    """
    result = _order_status(order_id)
    if result is None:
        return {"error": f"Order {order_id} not found"}
    return result


@mcp.tool()
def list_orders() -> list[dict]:
    """List every order that has been placed, newest first.

    Each order includes its id, customer name, status, total, and items.
    Use this when the customer asks to see all orders or order history.
    """
    return _list_orders()


@mcp.tool()
def list_pending_orders() -> list[dict]:
    """List every order the kitchen is still working on (not yet "ready").

    Each entry has customer_name, the live status ("pending" or "preparing"),
    eta_seconds (time until it is ready), total, and items — there is no order
    id. Always refer to these orders by the customer's name, never by an order
    number (e.g. "Ava's order is preparing, ready in about 3 minutes" rather
    than "Order #4 is pending"). Orders advance on a timer and disappear from
    this list once they are ready/complete.
    """
    return _list_pending_orders()


@mcp.tool()
def get_weather(city: str) -> dict:
    """Get the current weather for a city.

    Args:
        city: City name, e.g. "London" or "Kathmandu".
    """
    return _get_weather(city)


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
