import os

class Config:
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'SuaNovaSenha123'  # Coloque a senha diretamente aqui
    MYSQL_DB = 'sabor_e_clic'          # Corrigido de MTSQL_DB para MYSQL_DB
    MYSQL_PORT = 3306                  # Corrigido de MTSQL_POT para MYSQL_PORT

    SECRET_KEY = 'sabor_e_clic_chaveSecreta'

    DEBUG = True
    PORT = 5000