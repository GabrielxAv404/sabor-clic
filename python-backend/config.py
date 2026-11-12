import os

class Config:
    MYSQL_HOST = 'localhost'
    MYSQL_USER = 'root'
    MYSQL_PASSWORD = 'SuaNovaSenha123'  
    MYSQL_DB = 'sabor_e_clic'          
    MYSQL_PORT = 3306                  

    SECRET_KEY = 'sabor_e_clic_chaveSecreta'

    DEBUG = True
    PORT = 5000