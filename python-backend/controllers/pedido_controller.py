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

@pedido_blueprint.route("/api/pedidos/<int:pedido_id>/status", methods = ["PUT"])
def atulizar_status(pedido_id):
    dados =request.get_json()

    novo_status = dados.get("status", "pronto para entrega")
    sucesso, mensagem = pedido_db.atulizar_status(pedido_id, novo_status)
    
    if sucesso:
        return jsonify({"mensagem": mensagem})

    return jsonify({"erro": mensagem})