"""
scripts/make_admin.py
Grants admin privileges to an existing user by username.

Usage:
    python -m scripts.make_admin <username>

Example:
    python -m scripts.make_admin wiem
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.user import User


def make_admin(username: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"  [error] User '{username}' not found.")
            sys.exit(1)
        user.is_admin = True
        db.commit()
        print(f"  [ok]  '{username}' is now an admin. 🎉")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m scripts.make_admin <username>")
        sys.exit(1)
    make_admin(sys.argv[1])
