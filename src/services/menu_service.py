from src.db.database import get_session
from src.models.menu_item import MenuItem


def _to_dict(item: MenuItem) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category": item.category,
        "available": item.available,
    }


def get_menu(category: str | None = None) -> list[dict]:
    """Return all available menu items, optionally filtered by category."""
    with get_session() as s:
        query = s.query(MenuItem).filter(MenuItem.available == True)  # noqa: E712
        if category:
            query = query.filter(MenuItem.category == category)
        return [_to_dict(item) for item in query.all()]


def get_item(item_id: int) -> dict | None:
    """Return a single menu item by id, or None if not found."""
    with get_session() as s:
        item = s.get(MenuItem, item_id)
        return _to_dict(item) if item else None