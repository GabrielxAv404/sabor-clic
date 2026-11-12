from flask import Blueprint, jsonify, request
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
    username = dados.get('username')
    password = dados.get('password')
    cargo = dados.get('cargo')

    if not username or not password or not cargo:
        return jsonify({"erro": "Preencha todos os campos (usuário, senha e cargo)."}), 400

    sucesso, mensagem = Usuario_db.cadastrar_funcionario(username, password, cargo)
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
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
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