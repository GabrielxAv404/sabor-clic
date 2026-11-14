from flask import Blueprint, jsonify, request
from models.cardapio_model import cardapio_db
from database import get_db_connection

cardapio_blueprint = Blueprint('cardapio_bp', __name__)

def verificar_permissao_admin():
    dados = request.get_json() or {}
    id_admin = dados.get('id_admin') or request.args.get('id_admin')
    
    if not id_admin:
        return False
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT cargo FROM usuario WHERE id_usuario = %s", (id_admin,))
    usuario = cursor.fetchone()
    conn.close()
    
    return usuario and usuario['cargo'] == 'admin'

@cardapio_blueprint.route('/api/cardapio', methods=['GET'])
def listar_cardapio():
    return jsonify(cardapio_db.obter_todos()), 200

@cardapio_blueprint.route('/api/cardapio', methods=['POST'])
def criar_prato():
    dados = request.get_json() or {}

    if not verificar_permissao_admin():
        return jsonify({"erro": "Acesso negado. Apenas administradores podem cadastrar pratos."}), 403

    if not dados.get('nome') or not dados.get('preco'):
        return jsonify({"erro": "Nome e preço são obrigatórios."}), 400

    novo_prato = cardapio_db.adicionar(dados)
    return jsonify({"mensagem": "Prato cadastrado com sucesso", "prato": novo_prato}), 201

@cardapio_blueprint.route("/api/cardapio/<int:prato_id>", methods=["DELETE"])
def deletar_prato(prato_id):

    if not verificar_permissao_admin():
        return jsonify({"erro": "Acesso negado. Apenas administradores podem remover pratos."}), 403

    sucesso, mensagem = cardapio_db.deletar(prato_id)
    if sucesso:
        return jsonify({"mensagem": mensagem}), 200
    return jsonify({"erro": mensagem}), 404