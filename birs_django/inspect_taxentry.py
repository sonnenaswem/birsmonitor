import sqlite3, os
path = os.path.join(os.getcwd(), 'db.sqlite3')
print('DB exists:', os.path.exists(path))
conn = sqlite3.connect(path)
cur = conn.cursor()
cur.execute('PRAGMA table_info(tax_taxentry)')
print('tax_taxentry columns:')
for col in cur.fetchall():
    print(col)
print('\nSample rows:')
cur.execute('SELECT remita_amount, interswitch_amount, gokollect_amount, total_amount, date_of_remittance, remita, interswitch_ref, gokollect, source FROM tax_taxentry ORDER BY id DESC LIMIT 10')
for row in cur.fetchall():
    print(row)
conn.close()
