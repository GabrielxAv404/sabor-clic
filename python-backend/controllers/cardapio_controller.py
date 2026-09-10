from flask import Blueprint, jsonify, request
from models.cardapio_model import cardapio_db

cardapio_blueprint = Blueprint('cardapio_bp', __name__)

@cardapio_blueprint.route('/api/cardapio', methods=['GET'])
def listar_cardapio():
    return jsonify(cardapio_db.obter_todos()), 200

@cardapio_blueprint.route('/api/cardapio', methods=['POST'])
def criar_prato():
    dados = request.get_json()
    cardapio_db.adicionar(dados)
    return jsonify({"mensagem": "Prato cadastrado com sucesso"}), 201