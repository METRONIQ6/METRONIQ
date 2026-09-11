import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

conn = psycopg2.connect(dbname="postgres", user="postgres", password="postgres", host="localhost", port="5432")
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cursor = conn.cursor()

cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'metroniq'")
exists = cursor.fetchone()

if not exists:
    cursor.execute("CREATE DATABASE metroniq")
    print("CREATED metroniq")
else:
    print("metroniq ALREADY EXISTS")

cursor.close()
conn.close()
