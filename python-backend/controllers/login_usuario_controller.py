from flask import Blueprint, jsonify, request
from models.login_usuario_model import Usuario_db

LoginUsuario_blueprint = Blueprint('usuario_bp', __name__)

@LoginUsuario_blueprint.route("/api/login", methods=['POST'])
def login():
    dados = request.get_json()

    if not dados or not dados.get('username') or not dados.get('password'):
        return jsonify({"erro": "preencha todos os campos"}), 400

    usuario = Usuario_db.autenticar_usuario(dados.get('username'), dados.get('password'))

    if usuario:
        return jsonify({
            "mensagem": "Login realizado",
            "cargo": usuario["cargo"],
            "redirect": usuario["redirect"]
        }), 200
    else:
        return jsonify({"erro": "usuario ou senha incorreta"}), 401


@LoginUsuario_blueprint.route("/api/cadastro", methods=["POST"])
def cadastro():
    dados = request.get_json()

    if not dados or not dados.get('username') or not dados.get('password'):
        return jsonify({"erro": "preencha todos os campos"}), 400

    sucesso, mensagem = Usuario_db.cadastrar(dados.get('username'), dados.get('password'))

    if sucesso:
        return jsonify({"mensagem": mensagem}), 201
    else:
        return jsonify({"erro": mensagem}), 400