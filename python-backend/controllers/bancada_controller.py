from flask import Blueprint, jsonify, request
from database import get_db_connection

bancada_blueprint = Blueprint('bancada_bp', __name__)

@bancada_blueprint.route('/api/bancadas', methods=['GET'])
def listar_bancadas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id_bancada, identificacao, equipamentos FROM bancada")
    bancadas = cursor.fetchall()
    conn.close()
    return jsonify(bancadas), 200

@bancada_blueprint.route('/api/agendamentos', methods=['POST'])
def criar_agendamento():
    dados = request.get_json() or {}
    
    id_bancada = dados.get('id_bancada')
    id_cozinheiro = dados.get('id_cozinheiro')
    data_agendamento = dados.get('data_agendamento')
    hora_inicio = dados.get('hora_inicio')
    hora_fim = dados.get('hora_fim')

    if not id_bancada or not id_cozinheiro or not data_agendamento or not hora_inicio or not hora_fim:
        return jsonify({"erro": "Preencha todos os campos do agendamento."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = """
            INSERT INTO agendamento_bancada (id_bancada, id_usuario, data_agendamento, hora_inicio, hora_fim)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (id_bancada, id_cozinheiro, data_agendamento, hora_inicio, hora_fim))
        conn.commit()
        conn.close()
        return jsonify({"mensagem": "Bancada agendada com sucesso!"}), 201
    except Exception as err:
        conn.close()
        return jsonify({"erro": f"Erro ao agendar bancada: {str(err)}"}), 400

@bancada_blueprint.route('/api/agendamentos/funcionario/<int:id_funcionario>', methods=['GET'])
def historico_agendamentos_funcionario(id_funcionario):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        sql = """
            SELECT a.id_agendamento, b.identificacao AS bancada, a.data_agendamento, a.hora_inicio, a.hora_fim
            FROM agendamento_bancada a
            JOIN bancada b ON a.id_bancada = b.id_bancada
            WHERE a.id_usuario = %s
            ORDER BY a.data_agendamento DESC
        """
        cursor.execute(sql, (id_funcionario,))
        agendamentos = cursor.fetchall()
        conn.close()
        return jsonify(agendamentos), 200
    except Exception as err:
        conn.close()
        return jsonify({"erro": f"Erro ao buscar histórico: {str(err)}"}), 400