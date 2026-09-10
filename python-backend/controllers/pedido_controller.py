from flask import Blueprint, jsonify, request
from models.pedido_model import pedido_db

pedido_blueprint = Blueprint('pedidos', __name__)

@pedido_blueprint.route('/api/pedidos', methods=['GET'])
def listar():
    return jsonify(pedido_db.obter_todos()), 200

@pedido_blueprint.route('/api/pedidos', methods=['POST'])
def criar():
    dados = request.get_json()
    pedido_db.adicionar(dados)
    return jsonify({"mensagem": "Pedido criado com sucesso"}), 201