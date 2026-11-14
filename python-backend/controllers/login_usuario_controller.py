from flask import Blueprint, jsonify, request, session
from models.login_usuario_model import Usuario_db
from database import get_db_connection

LoginUsuario_blueprint = Blueprint('usuario_bp', __name__)

@LoginUsuario_blueprint.route("/api/login", methods=['POST'])
def login():
    dados = request.get_json()

    if not dados or not dados.get('email') or not dados.get('password'):
        return jsonify({"erro": "Preencha todos os campos."}), 400

    usuario = Usuario_db.autenticar_usuario(dados.get('email'), dados.get('password'))

    if usuario:
        session['user_id'] = usuario["id"]
        session['username'] = usuario["username"]
        session['cargo'] = usuario["cargo"]

        return jsonify({
            "mensagem": "Login realizado com sucesso",
            "id": usuario["id"],
            "username": usuario["username"],
            "email": usuario.get("email"),
            "cargo": usuario["cargo"],
            "redirect": usuario["redirect"]
        }), 200
    else:
        return jsonify({"erro": "E-mail ou senha incorretos."}), 401

@LoginUsuario_blueprint.route("/api/verificar-sessao", methods=['GET'])
def verificar_sessao():
    if 'user_id' in session:
        return jsonify({
            "autenticado": True,
            "id": session['user_id'],
            "username": session['username'],
            "cargo": session['cargo']
        }), 200
    return jsonify({"autenticado": False}), 401

@LoginUsuario_blueprint.route("/api/logout", methods=['POST'])
def logout():
    session.clear() 
    return jsonify({"mensagem": "Sessão encerrada com sucesso."}), 200


@LoginUsuario_blueprint.route("/api/cadastro", methods=["POST"])
def cadastro():
    dados = request.get_json()

    if not dados or not dados.get('email') or not dados.get('username') or not dados.get('telefone') or not dados.get('endereco') or not dados.get('password'):
        return jsonify({"erro": "Preencha todos os campos do formulário."}), 400

    sucesso, mensagem = Usuario_db.cadastrar_usuario(
        dados.get('email'),
        dados.get('username'),
        dados.get('telefone'),
        dados.get('endereco'),
        dados.get('password')
    )

    if sucesso:
        return jsonify({"mensagem": mensagem}), 201
    else:
        return jsonify({"erro": mensagem}), 400

    
@LoginUsuario_blueprint.route("/api/admin/cadastrar-funcionario", methods=["POST"])
def cadastrar_funcionario():
    dados = request.get_json()
    
    id_admin_requisitante = dados.get('id_admin')
    if not id_admin_requisitante:
        return jsonify({"erro": "Acesso não autorizado. Apenas administradores podem cadastrar funcionários."}), 403

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT cargo FROM usuario WHERE id_usuario = %s", (id_admin_requisitante,))
    admin_user = cursor.fetchone()
    conn.close()

    if not admin_user or admin_user['cargo'] != 'admin':
        return jsonify({"erro": "Acesso negado. Privilégios insuficientes."}), 403

    username = dados.get('username')
    email = dados.get('email')
    password = dados.get('password')
    cargo_pretendido = dados.get('cargo')

    if not username or not email or not password or not cargo_pretendido:
        return jsonify({"erro": "Preencha todos os campos (usuário, e-mail, senha e cargo)."}), 400

    cargos_permitidos = ['cozinha']
    if cargo_pretendido not in cargos_permitidos:
        return jsonify({"erro": "Cargo inválido ou não autorizado para criação por este painel."}), 400

    sucesso, mensagem = Usuario_db.cadastrar_funcionario(username, email, password, cargo_pretendido)
    if sucesso:
        return jsonify({"mensagem": mensagem}), 201
    return jsonify({"erro": mensagem}), 400

@LoginUsuario_blueprint.route('/api/perfil/editar', methods=['POST'])
def editar_perfil():
    dados = request.get_json()
    id_usuario = dados.get('id_usuario', 1) 
    
    sucesso, mensagem = Usuario_db.atualizar_perfil(id_usuario, dados)
    if sucesso:
        return jsonify({"mensagem": mensagem}), 200
    return jsonify({"erro": mensagem}), 400

@LoginUsuario_blueprint.route('/api/endereco', methods=['POST'])
def salvar_endereco():
    dados = request.get_json()
    id_usuario = dados.get('id_usuario', 1)

    sucesso, mensagem = Usuario_db.salvar_endereco(id_usuario, dados)
    if sucesso:
        return jsonify({"mensagem": mensagem}), 201
    return jsonify({"erro": mensagem}), 400

@LoginUsuario_blueprint.route('/api/admin/funcionarios', methods=['GET'])
def listar_funcionarios():
    id_admin = request.args.get('id_admin')
    if not id_admin:
        return jsonify({"erro": "Acesso não autorizado."}), 403

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT cargo FROM usuario WHERE id_usuario = %s", (id_admin,))
    admin = cursor.fetchone()
    
    if not admin or admin['cargo'] != 'admin':
        conn.close()
        return jsonify({"erro": "Acesso negado."}), 403

    cursor.execute("SELECT id_usuario AS id, username, cargo FROM usuario WHERE cargo IN ('cozinha', 'admin')")
    funcionarios = cursor.fetchall()
    conn.close()
    return jsonify(funcionarios), 200

@LoginUsuario_blueprint.route('/api/perfil/<int:id_usuario>', methods=['GET'])
def obter_perfil(id_usuario):
    perfil = Usuario_db.obter_perfil_completo(id_usuario)
    if perfil:
        return jsonify(perfil), 200
    return jsonify({"erro": "Perfil não encontrado."}), 404
    
@LoginUsuario_blueprint.route('/api/seguranca/senha', methods=['PUT'])
def alterar_senha():
    dados = request.get_json()
    id_usuario = dados.get('id_usuario')
    nova_senha = dados.get('nova_senha')

    if not id_usuario or not nova_senha:
        return jsonify({"erro": "Dados incompletos."}), 400

    sucesso, mensagem = Usuario_db.atualizar_senha(id_usuario, nova_senha)
    if sucesso:
        return jsonify({"mensagem": mensagem}), 200
    return jsonify({"erro": mensagem}), 400

@LoginUsuario_blueprint.route('/api/endereco/atualizar', methods=['PUT'])
def atualizar_endereco():
    dados = request.get_json()
    id_usuario = dados.get('id_usuario')

    if not id_usuario:
        return jsonify({"erro": "Usuário não autenticado."}), 400

    sucesso, mensagem = Usuario_db.atualizar_endereco(id_usuario, dados)
    if sucesso:
        return jsonify({"mensagem": mensagem}), 200
    return jsonify({"erro": mensagem}), 400