import snowflake.connector

# Snowflakeへの接続情報
conn = snowflake.connector.connect(    
    account='VBXJGPQ',
    user='SZUKIYU',
    password='09058469162Ys!',
    warehouse='MY_WAREHOUSE',
    database='MY_DATABASE',
    schema='PUBLIC'
)

# カーソルの作成
cur = conn.cursor()

# クエリの実行（例: バージョン情報の取得）
cur.execute("SELECT CURRENT_VERSION()")

# 結果の取得
one_row = cur.fetchone()
print(one_row)

# カーソルと接続のクローズ
cur.close()
conn.close()
