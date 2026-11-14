from database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario:
    def atualizar_senha(self, id_usuario, nova_senha):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            novo_hash = generate_password_hash(nova_senha)
            sql = "UPDATE usuario SET senha_hash = %s WHERE id_usuario = %s"
            cursor.execute(sql, (novo_hash, id_usuario))
            conn.commit()
            conn.close()
            return True, "Senha atualizada com sucesso!"
        except Exception as err:
            conn.close()
            return False, f"Erro ao atualizar senha: {str(err)}"

    def atualizar_endereco(self, id_usuario, dados):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id_endereco FROM endereco_usuario WHERE id_usuario = %s", (id_usuario,))
            if cursor.fetchone():
                sql = """
                    UPDATE endereco_usuario 
                    SET cidade = %s, cep = %s, bairro = %s, rua = %s, numero = %s 
                    WHERE id_usuario = %s
                """
                cursor.execute(sql, (
                    dados.get('cidade'), dados.get('cep'), dados.get('bairro'),
                    dados.get('rua'), dados.get('numero'), id_usuario
                ))
            else:
                sql = """
                    INSERT INTO endereco_usuario (id_usuario, cidade, cep, bairro, rua, numero)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (
                    id_usuario, dados.get('cidade'), dados.get('cep'),
                    dados.get('bairro'), dados.get('rua'), dados.get('numero')
                ))
            conn.commit()
            conn.close()
            return True, "Endereço atualizado com sucesso!"
        except Exception as err:
            conn.close()
            return False, f"Erro ao atualizar endereço: {str(err)}"

    def autenticar_usuario(self, identificador, password):
        # Autenticação unificada e segura para todos os utilizadores (incluindo admin e funcionários)
        # Permite autenticar tanto por e-mail quanto por username
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id_usuario AS id, u.username, u.senha_hash, u.cargo, p.email
            FROM usuario u
            LEFT JOIN perfil_usuario p ON u.id_usuario = p.id_usuario
            WHERE p.email = %s OR u.username = %s
        """, (identificador, identificador))
        usuario = cursor.fetchone()
        conn.close()

        if usuario and check_password_hash(usuario['senha_hash'], password):
            redirect_map = {
                "admin": "admin.html",
                "cozinha": "Painelcozinha.html",
                "cliente": "index.html"
            }
            usuario['redirect'] = redirect_map.get(usuario['cargo'], "index.html")
            return usuario
        return None

    def cadastrar_usuario(self, email, username, telefone, endereco, password):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id_usuario FROM usuario WHERE username = %s", (username,))
        if cursor.fetchone():
            conn.close()
            return False, "Nome de usuário já existe"
        
        cursor.execute("SELECT id_usuario FROM perfil_usuario WHERE email = %s", (email,))
        if cursor.fetchone():
            conn.close()
            return False, "E-mail já cadastrado"

        try:
            sql_usuario = "INSERT INTO usuario (username, senha_hash, cargo) VALUES (%s, %s, %s)"
            cursor.execute(sql_usuario, (username, generate_password_hash(password), "cliente"))
            id_usuario = cursor.lastrowid

            sql_perfil = "INSERT INTO perfil_usuario (id_usuario, email, telefone) VALUES (%s, %s, %s)"
            cursor.execute(sql_perfil, (id_usuario, email, telefone))

            sql_endereco = "INSERT INTO endereco_usuario (id_usuario, rua) VALUES (%s, %s)"
            cursor.execute(sql_endereco, (id_usuario, endereco))

            conn.commit()
            conn.close()
            return True, "Cliente cadastrado com sucesso"
        except Exception as err:
            conn.rollback()
            conn.close()
            return False, f"Erro ao cadastrar usuário: {str(err)}"

    def cadastrar_funcionario(self, username, email, password, cargo):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id_usuario FROM usuario WHERE username = %s", (username,))
        if cursor.fetchone():
            conn.close()
            return False, "Nome de usuário já existe"
        
        cursor.execute("SELECT id_usuario FROM perfil_usuario WHERE email = %s", (email,))
        if cursor.fetchone():
            conn.close()
            return False, "E-mail já cadastrado"

        try:
            sql_usuario = "INSERT INTO usuario (username, senha_hash, cargo) VALUES (%s, %s, %s)"
            cursor.execute(sql_usuario, (username, generate_password_hash(password), cargo))
            id_usuario = cursor.lastrowid

            sql_perfil = "INSERT INTO perfil_usuario (id_usuario, email) VALUES (%s, %s)"
            cursor.execute(sql_perfil, (id_usuario, email))

            conn.commit()
            conn.close()
            return True, f"Funcionário ({cargo}) cadastrado com sucesso"
        except Exception as err:
            conn.rollback()
            conn.close()
            return False, f"Erro ao cadastrar funcionário: {str(err)}"

    def atualizar_perfil(self, id_usuario, dados):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT id_perfil FROM perfil_usuario WHERE id_usuario = %s", (id_usuario,))
            if cursor.fetchone():
                sql = "UPDATE perfil_usuario SET nome_completo = %s, email = %s, telefone = %s WHERE id_usuario = %s"
                cursor.execute(sql, (dados.get('nome'), dados.get('email'), dados.get('telefone'), id_usuario))
            else:
                sql = "INSERT INTO perfil_usuario (id_usuario, nome_completo, email, telefone) VALUES (%s, %s, %s, %s)"
                cursor.execute(sql, (id_usuario, dados.get('nome'), dados.get('email'), dados.get('telefone')))
            
            conn.commit()
            conn.close()
            return True, "Perfil atualizado com sucesso!"
        except Exception as err:
            conn.close()
            return False, f"Erro ao atualizar perfil: {str(err)}"

    def salvar_endereco(self, id_usuario, dados):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            sql = """
                INSERT INTO endereco_usuario (id_usuario, cidade, cep, bairro, rua, numero)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                id_usuario,
                dados.get('cidade'),
                dados.get('cep'),
                dados.get('bairro'),
                dados.get('rua'),
                dados.get('numero')
            ))
            conn.commit()
            conn.close()
            return True, "Endereço cadastrado com sucesso!"
        except Exception as err:
            conn.close()
            return False, f"Erro ao salvar endereço: {str(err)}"

    def obter_perfil_completo(self, id_usuario):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT u.id_usuario, u.username, u.cargo,
                   p.email, p.telefone,
                   e.cidade, e.bairro, e.rua, e.numero
            FROM usuario u
            LEFT JOIN perfil_usuario p ON u.id_usuario = p.id_usuario
            LEFT JOIN endereco_usuario e ON u.id_usuario = e.id_usuario
            WHERE u.id_usuario = %s
            LIMIT 1
        """, (id_usuario,))
        perfil = cursor.fetchone()
        conn.close()
        return perfil
    
Usuario_db = Usuario()