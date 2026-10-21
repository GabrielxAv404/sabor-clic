from database import get_db_connection

class Usuario:
    def autenticar_usuario(self, username, password):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_usuario AS id, username, senha_hash, cargo
            FROM usuario
            WHERE username = %s
        """, (username,))
        usuario = cursor.fetchone()
        conn.close()

        if usuario and password in usuario['senha_hash']:
            redirect_map = {
                "admin": "admin.html",
                "cozinha": "Painelcozinha.html",
                "cliente": "index.html"
            }
            usuario['redirect'] = redirect_map.get(usuario['cargo'], "index.html")
            return usuario
        return None

    def cadastrar_usuario(self, username, password):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id_usuario FROM usuario WHERE username = %s", (username,))
        if cursor.fetchone():
            conn.close()
            return False, "Usuário já existe"

        sql = "INSERT INTO usuario (username, senha_hash, cargo) VALUES (%s, %s, %s)"
        cursor.execute(sql, (username, f"pbkdf2:sha256:1000${password}", "cliente"))
        conn.commit()
        conn.close()
        return True, "Cliente cadastrado com sucesso"

    def cadastrar_funcionario(self, username, password, cargo):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id_usuario FROM usuario WHERE username = %s", (username,))
        if cursor.fetchone():
            conn.close()
            return False, "Usuário já existe"
        
        sql = "INSERT INTO usuario (username, senha_hash, cargo) VALUES (%s, %s, %s)"
        cursor.execute(sql, (username, f"pbkdf2:sha256:1000${password}", cargo))
        conn.commit()
        conn.close()
        return True, f"Funcionário ({cargo}) cadastrado com sucesso"

Usuario_db = Usuario()