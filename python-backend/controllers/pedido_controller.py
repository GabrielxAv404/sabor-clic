from flask import Blueprint, jsonify, request
from models.pedido_model import pedido_db
from database import get_db_connection

pedido_blueprint = Blueprint('pedidos', __name__)

def verificar_permissao_funcionario():
    id_usuario = request.args.get('id_usuario') or (request.get_json() or {}).get('id_usuario')
    if not id_usuario:
        return False
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT cargo FROM usuario WHERE id_usuario = %s", (id_usuario,))
    usuario = cursor.fetchone()
    conn.close()
    
    return usuario and usuario['cargo'] in ['admin', 'cozinha']

@pedido_blueprint.route('/api/pedidos', methods=['GET'])
def listar():
    id_usuario_filtro = request.args.get('id_usuario')
    
    if not id_usuario_filtro or request.args.get('visao_painel') == 'true':
        if not verificar_permissao_funcionario():
            return jsonify({"erro": "Acesso negado."}), 403
        return jsonify(pedido_db.obter_todos()), 200
        
    return jsonify(pedido_db.obter_por_usuario(id_usuario_filtro)), 200

@pedido_blueprint.route('/api/pedidos/<int:pedido_id>', methods=['GET'])
def rastrear(pedido_id):
    pedido = pedido_db.obter_por_id(pedido_id)
    if pedido:
        return jsonify(pedido), 200
    return jsonify({"erro": "Pedido não encontrado."}), 404

@pedido_blueprint.route('/api/pedidos', methods=['POST'])
def criar():
    dados = request.get_json()
    if not dados or not dados.get('nome_usuario') or not dados.get('nome_comida'):
        return jsonify({"erro": "Preencha os campos do pedido."}), 400

    pedido_criado = pedido_db.adicionar(dados)
    return jsonify({
        "mensagem": "Pedido criado com sucesso",
        "id_pedido": pedido_criado['id']
    }), 201

@pedido_blueprint.route("/api/pedidos/<int:pedido_id>/status", methods=["PUT"])
def atualizar_status(pedido_id):
    dados = request.get_json() or {}

    novo_status = dados.get("status", "EM PREPARO")
    tempo_estimado = dados.get("tempo_estimado", None)
    sucesso, mensagem = pedido_db.atualizar_status(pedido_id, novo_status, tempo_estimado)
    
    if sucesso:
        return jsonify({"mensagem": mensagem}), 200

    return jsonify({"erro": mensagem}), 404