from src.db.database import SessionLocal, init_db
from src.models.menu_item import MenuItem

# The starter menu. Photos are stable, direct Unsplash image URLs sized for
# menu cards — real photography, not invented stock captions.
MENU_ITEMS = [
    {"name": "Margherita Pizza", "description": "Tomato, mozzarella, basil",
     "price": 9.99,  "category": "pizza",
     "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=450&fit=crop&auto=format"},
    {"name": "Pepperoni Pizza",  "description": "Pepperoni and cheese",
     "price": 11.99, "category": "pizza",
     "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=450&fit=crop&auto=format"},
    {"name": "Caesar Salad",     "description": "Romaine, parmesan, croutons",
     "price": 6.50,  "category": "salad",
     "image_url": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=450&fit=crop&auto=format"},
    {"name": "Coca-Cola",        "description": "330ml can",
     "price": 1.99,  "category": "drink",
     "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=450&fit=crop&auto=format"},
    {"name": "Tiramisu",         "description": "Classic Italian dessert",
     "price": 5.50,  "category": "dessert",
     "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=450&fit=crop&auto=format"},
]


def seed():
    # Make sure tables exist (and migrated) before inserting.
    init_db()

    session = SessionLocal()
    try:
        existing = {item.name: item for item in session.query(MenuItem).all()}

        if not existing:
            # Turn each dict into a MenuItem object.
            items = [MenuItem(**data) for data in MENU_ITEMS]
            session.add_all(items)
            session.commit()
            print(f"Seeded {len(items)} menu items.")
            return

        # Already seeded on an earlier run — just backfill any photos that
        # are missing (e.g. rows created before image_url existed).
        updated = 0
        for data in MENU_ITEMS:
            item = existing.get(data["name"])
            if item is not None and not item.image_url:
                item.image_url = data["image_url"]
                updated += 1
        if updated:
            session.commit()
            print(f"Backfilled photos for {updated} menu item(s).")
        else:
            print("Menu already seeded, skipping.")
    except Exception:
        session.rollback()   # undo on any error
        raise
    finally:
        session.close()      # always release the connection


if __name__ == "__main__":
    seed()