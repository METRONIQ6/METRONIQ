import psycopg2
import sys

try:
    conn = psycopg2.connect("postgresql://postgres:postgres@localhost:5432/metroniq")
    cur = conn.cursor()
    cur.execute("SELECT version();")
    print(cur.fetchone()[0])
    
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    tables = [row[0] for row in cur.fetchall()]
    print("Tables:", tables)

    for table in ['inspections', 'ecommerce_monitors', 'rule_versions', 'rules', 'users', 'enforcement_cases', 'improvement_notices']:
        if table in tables:
            cur.execute(f"SELECT count(*) FROM {table};")
            print(f"Table {table}: {cur.fetchone()[0]} rows")
            
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
    sys.exit(1)
