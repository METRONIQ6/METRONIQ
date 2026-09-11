import os
import sqlalchemy
from sqlalchemy import create_engine, select, func

os.environ['DATABASE_URL'] = 'sqlite:///./metroniq-dev.db'
pg_url = 'postgresql://postgres:postgres@localhost:5432/metroniq'

# Bind the models
from app.models import Base

sqlite_engine = create_engine('sqlite:///./metroniq-dev.db')
pg_engine = create_engine(pg_url)

print("Creating tables in PostgreSQL...")
Base.metadata.create_all(pg_engine)

print("Migrating data...")
with sqlite_engine.connect() as conn_sl:
    with pg_engine.begin() as conn_pg:
        # Disable foreign key checks for PostgreSQL during insertion
        conn_pg.execute(sqlalchemy.text("SET session_replication_role = 'replica';"))

        for table in Base.metadata.sorted_tables:
            print(f"Migrating {table.name}...")
            rows = conn_sl.execute(table.select()).mappings().all()
            print(f"Found {len(rows)} rows in SQLite.")
            if rows:
                conn_pg.execute(table.insert(), [dict(row) for row in rows])

        for table in Base.metadata.sorted_tables:
            c_pg = conn_pg.scalar(select(func.count()).select_from(table))
            c_sl = conn_sl.scalar(select(func.count()).select_from(table))
            if c_pg != c_sl:
                print(f"WARNING: Row mismatch in {table.name} (PG: {c_pg}, SL: {c_sl})")
            else:
                print(f"PostgreSQL row count verified for {table.name}: {c_pg}")
        
        # Reset FK checks
        conn_pg.execute(sqlalchemy.text("SET session_replication_role = 'origin';"))

print("Migration completed.")
