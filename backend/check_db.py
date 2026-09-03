import sqlite3
import pandas as pd
conn = sqlite3.connect("metroniq-dev.db")
print(pd.read_sql("SELECT target_url, last_scan_result FROM ecommerce_monitors;", conn))
