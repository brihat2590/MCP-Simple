from mcp.server import MCPServer

from src.services.menu_service import get_menu as _get_menu
from src.services.order_service import (
    place_order as _place_order,
    order_status as _order_status,
)

# The server instance. "restaurant" is its name; the LLM sees this.
mcp=MCPServer("restaurant")


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

    Args:
        order_id: The id returned when the order was placed.
    """
    result = _order_status(order_id)
    if result is None:
        return {"error": f"Order {order_id} not found"}
    return result


if __name__ == "__main__":
    # Run over HTTP so the Next.js AI SDK can connect by URL.
    mcp.run(transport="streamable-http")