import mysql.connector
from config import Config

def get_database_connection():
    """Cria e retorna uma conexão ativa com o banco de dados MySQL."""
    return mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        port=Config.MYSQL_PORT
    )

# Atalho caso alguns dos seus modelos chamem get_db_connection
get_db_connection = get_database_connection