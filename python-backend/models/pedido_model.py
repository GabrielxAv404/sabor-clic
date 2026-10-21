from database import get_db_connection

class PedidoModel:
    def obter_todos(self):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_pedido AS id, nome_usuario, nome_comida, quantidade, status, tempo_estimado_min
            FROM pedido
            ORDER BY id_pedido DESC
        """)
        pedidos = cursor.fetchall()
        conn.close()
        return pedidos

    def obter_por_id(self, pedido_id):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_pedido AS id, nome_usuario, nome_comida, quantidade, status, tempo_estimado_min
            FROM pedido
            WHERE id_pedido = %s
        """, (pedido_id,))
        pedido = cursor.fetchone()
        conn.close()
        return pedido

    def adicionar(self, novo_pedido):
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            INSERT INTO pedido (nome_usuario, nome_comida, quantidade, status)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(sql, (
            novo_pedido['nome_usuario'],
            novo_pedido['nome_comida'],
            novo_pedido['quantidade'],
            novo_pedido.get('status', 'AGUARDANDO')
        ))
        conn.commit()
        id_criado = cursor.lastrowid
        conn.close()

        novo_pedido['id'] = id_criado
        return novo_pedido
    
    def atualizar_status(self, pedido_id, novo_status):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE pedido SET status = %s WHERE id_pedido = %s", (novo_status, pedido_id))
        linhas_afetadas = cursor.rowcount
        conn.commit()
        conn.close()

        if linhas_afetadas > 0:
            return True, f"Pedido #{pedido_id} alterado para: {novo_status}"
        return False, "Pedido não encontrado"

pedido_db = PedidoModel()