from db import engine
from sqlalchemy import text


def alter_db(*, quiet: bool = False):
    """
    Additive schema updates (IF NOT EXISTS). Run manually: python alter_db.py
    Also invoked once at FastAPI startup so ORM columns stay in sync with Postgres.
    """
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE publicsubmissions ADD COLUMN IF NOT EXISTS skintone VARCHAR;"))
        conn.execute(text("ALTER TABLE publicsubmissions ADD COLUMN IF NOT EXISTS spectacles VARCHAR;"))
        conn.execute(text("ALTER TABLE publicsubmissions ADD COLUMN IF NOT EXISTS hair_color VARCHAR;"))
        conn.execute(text("ALTER TABLE publicsubmissions ADD COLUMN IF NOT EXISTS gender VARCHAR;"))
        conn.execute(
            text(
                "ALTER TABLE privatecaseregistrations ADD COLUMN IF NOT EXISTS gender VARCHAR "
                "NOT NULL DEFAULT 'Prefer not to say';"
            )
        )
    if not quiet:
        print("Database altered successfully")


if __name__ == "__main__":
    alter_db()
