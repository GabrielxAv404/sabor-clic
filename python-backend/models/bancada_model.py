from database import get_db_connection

class BancadaModel:
    def obter_todas(self):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_bancada, identificacao, equipamentos, status FROM bancada WHERE status = 'DISPONIVEL'")
        bancadas = cursor.fetchall()
        conn.close()
        return bancadas

    def agendar(self, dados_agendamento):
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            sql = """
                INSERT INTO agendamento_bancada (id_bancada, id_cozinheiro, data_agendamento, hora_inicio, hora_fim)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                dados_agendamento['id_bancada'],
                dados_agendamento.get('id_cozinheiro', 1),
                dados_agendamento['data_agendamento'],
                dados_agendamento['hora_inicio'],
                dados_agendamento['hora_fim']
            ))
            conn.commit()
            conn.close()
            return True, "Bancada agendada com sucesso!"
        except Exception as err:
            conn.close()
            return False, f"Erro ao agendar bancada: {str(err)}"

bancada_db = BancadaModel()