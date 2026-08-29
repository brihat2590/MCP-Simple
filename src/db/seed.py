from src.db.database import SessionLocal, init_db
from src.models.menu_item import MenuItem

# The starter menu.
MENU_ITEMS = [
    {"name": "Margherita Pizza", "description": "Tomato, mozzarella, basil",
     "price": 9.99,  "category": "pizza"},
    {"name": "Pepperoni Pizza",  "description": "Pepperoni and cheese",
     "price": 11.99, "category": "pizza"},
    {"name": "Caesar Salad",     "description": "Romaine, parmesan, croutons",
     "price": 6.50,  "category": "salad"},
    {"name": "Coca-Cola",        "description": "330ml can",
     "price": 1.99,  "category": "drink"},
    {"name": "Tiramisu",         "description": "Classic Italian dessert",
     "price": 5.50,  "category": "dessert"},
]


def seed():
    # Make sure tables exist before inserting.
    init_db()

    session = SessionLocal()
    try:
        # Idempotency guard: don't double-seed if data already exists.
        if session.query(MenuItem).count() > 0:
            print("Menu already seeded, skipping.")
            return

        # Turn each dict into a MenuItem object.
        items = [MenuItem(**data) for data in MENU_ITEMS]
        session.add_all(items)
        session.commit()
        print(f"Seeded {len(items)} menu items.")
    except Exception:
        session.rollback()   # undo on any error
        raise
    finally:
        session.close()      # always release the connection


if __name__ == "__main__":
    seed()