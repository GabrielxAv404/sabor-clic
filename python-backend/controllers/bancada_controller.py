from flask import Blueprint, jsonify, request
from models.bancada_model import bancada_db

bancada_blueprint = Blueprint('bancada', __name__)

@bancada_blueprint.route('/api/bancada', methods = ['GET'])
def listar_bancada():
    return jsonify(bancada_db.obter_todas()),200


@bancada_blueprint.route('/api/bancada/agendar', methods = ['POST'])
def agendar_bancada():
    dados =request.get_json()
    if not dados or not dados.get('id_bancada') or not dados.get('data_agendamento'):
        return jsonify({"erro": "Preencha as informações do agendamento"}),400

    sucesso, mensagem = bancada_db.agendar(dados)
    if sucesso:
        return jsonify({"mensagem": mensagem})
    return jsonify({"erro": mensagem})