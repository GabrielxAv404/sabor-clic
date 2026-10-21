from flask import Blueprint, jsonify, request
from models.cardapio_model import cardapio_db

cardapio_blueprint = Blueprint('cardapio_bp', __name__)

@cardapio_blueprint.route('/api/cardapio', methods=['GET'])
def listar_cardapio():
    return jsonify(cardapio_db.obter_todos()), 200

@cardapio_blueprint.route('/api/cardapio', methods=['POST'])
def criar_prato():
    dados = request.get_json()
    if not dados or not dados.get('nome') or not dados.get('preco'):
        return jsonify({"erro": "Nome e preço são obrigatorios"}), 400

    novo_prato = cardapio_db.adicionar(dados)
    return jsonify({"mensagem": "Prato cadastrado com sucesso"}), 201

@cardapio_blueprint.route("/api/cardapio/<int:prato_id>", methods = ["DELETE"])
def deletar_prato(prato_id):
    sucesso, mensagem = cardapio_db.deletar(prato_id)
    if sucesso:
        return jsonify({"mensagem": mensagem}), 200
    return jsonify({"erro": mensagem}), 404