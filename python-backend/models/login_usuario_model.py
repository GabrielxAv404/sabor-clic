class Usuario:
    def __init__(self):
        self.usuarios = [{"username": "admin", "password": "123", "cargo": "admin", "redirect": "admin.html"},
            {"username": "cozinheiro", "password": "123", "cargo": "cozinha", "redirect": "Painelcozinha.html"},
            {"username": "cliente", "password": "123", "cargo": "cliente", "redirect": "index.html"}]

    @staticmethod
    def autenticar_usuario(username, password, tipo_login):
        for usuario in Usuario.usuarios:
            if usuario['username'] == username and usuario['password'] == password:
                return tipo_login
            else:
                return None

    @staticmethod
    def cadastrar_usuario(username, password):
        username = input("Informe o nome de usuário: ")
        password = input("Informe a senha: ")
        for usuario in Usuario.usuarios:
            if usuario['username'] == username:
                return username, password
            else:
                return None

Usuario_db =Usuario()