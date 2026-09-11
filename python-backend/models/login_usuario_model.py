class Usuario:
    def __init__(self):
        self.usuarios = [
            {"username": "admin", "password": "123", "cargo": "admin", "redirect": "admin.html"},
            {"username": "cozinheiro", "password": "123", "cargo": "cozinha", "redirect": "Painelcozinha.html"},
            {"username": "cliente", "password": "123", "cargo": "cliente", "redirect": "index.html"}]


    def autenticar_usuario(self, username, password):
        for usuario in self.usuarios:
            if usuario['username'] == username and usuario['password'] == password:
                return usuario
            
        return None

    def cadastrar_usuario(self,username, password):

        for usuario in self.usuarios:
            if usuario['username'] == username:
                return False,'usuario já existe'

        novo_usuario = {
            "username": username,
            "password": password,
            "cargo": "cliente",
            "redirect": "index.html"
        }

        self.usuarios.append(novo_usuario)
        return True, "Cliente cadastrado com sucesso"
    
    def cadastrar_funcionario(self, username, password, cargo):
        for usuario in self.usuarios:
            if usuario['username'] == username:
                return False, "usuario já existe"

        redirect = {
            "admin": "admin.html",
            "cozinha": "Painelcozinha.html"
        }
        novo_funcionario = {
            "username": username,
            "password": password,
            "cargo": cargo,
            "redirect": redirect.get(cargo,"index.html")
        }

        self.usuarios.append(novo_funcionario)
        return True, f"Funcionario ({cargo}) cadastrado com sucesso "
Usuario_db =Usuario()