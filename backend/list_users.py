import sqlite3
import pandas as pd
conn = sqlite3.connect("metroniq-dev.db")
try:
    print(pd.read_sql("SELECT email, role FROM users", conn))
except Exception as e:
    print(e)
