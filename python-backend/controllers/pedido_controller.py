from flask import Blueprint, jsonify, request
from models.pedido_model import pedido_db

pedido_blueprint = Blueprint('pedidos', __name__)

@pedido_blueprint.route('/api/pedidos', methods=['GET'])
def listar():
    return jsonify(pedido_db.obter_todos()), 200

@pedido_blueprint.route('/api/pedido/<int:pedido_id>', methods = ['GET'])
def rastrear(pedido_id):
    pedido = pedido_db.obter_por_id(pedido_id)
    if pedido:
        return jsonify(pedido), 200
    return jsonify({"erro": "Pedido não encontrado."}), 404

@pedido_blueprint.route('/api/pedidos', methods=['POST'])
def criar():
    dados = request.get_json()
    if not dados or not dados.get('nome_usuario') or not dados.get('nome_comida'):
        return jsonify({"erro": "Preencha os campos do pedido."}),400
    pedido_criado = pedido_db.adicionar(dados)
    return jsonify({""
    "mensagem": "Pedido criado com sucesso",
    "id_pedido": pedido_criado['id']
    }), 201

@pedido_blueprint.route("/api/pedidos/<int:pedido_id>/status", methods = ["PUT"])
def atulizar_status(pedido_id):
    dados = request.get_json() or {}

    novo_status = dados.get("status", "pronto para entrega")
    sucesso, mensagem = pedido_db.atulizar_status(pedido_id, novo_status)
    
    if sucesso:
        return jsonify({"mensagem": mensagem}), 200

    return jsonify({"erro": mensagem}), 404