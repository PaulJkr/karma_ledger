import sqlite3

db_path = "db.sqlite"

table_name = input("enter table name: ") # change to your actual table name

# Connect to the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
print(f"Table '{table_name}' dropped successfully.")

# Commit and close
conn.commit()
conn.close()
