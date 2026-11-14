from database import get_db_connection

class PedidoModel:
    def obter_todos(self):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_pedido AS id, id_usuario, nome_usuario, nome_comida, quantidade, status, tempo_estimado_min
            FROM pedido
            ORDER BY id_pedido DESC
        """)
        pedidos = cursor.fetchall()
        conn.close()
        return pedidos

    def obter_por_usuario(self, id_usuario):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_pedido AS id, id_usuario, nome_usuario, nome_comida, quantidade, status, tempo_estimado_min
            FROM pedido
            WHERE id_usuario = %s
            ORDER BY id_pedido DESC
        """, (id_usuario,))
        pedidos = cursor.fetchall()
        conn.close()
        return pedidos

    def adicionar(self, novo_pedido):
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """
            INSERT INTO pedido (id_usuario, nome_usuario, nome_comida, quantidade, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            novo_pedido.get('id_usuario'),
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
    
    def atualizar_status(self, pedido_id, novo_status, tempo_estimado = None):
        conn = get_db_connection()
        cursor = conn.cursor()

        if tempo_estimado:
            sql = "UPDATE pedido SET status = %s, tempo_estimado_min = %s WHERE id_pedido = %s"
            cursor.execute(sql, (novo_status, tempo_estimado, pedido_id))
        else:
            sql = "UPDATE pedido SET status = %s WHERE id_pedido = %s"    
            cursor.execute(sql, (novo_status, pedido_id))
        
        linhas_afetadas = cursor.rowcount
        conn.commit()
        conn.close()

        if linhas_afetadas > 0:
            return True, f"Pedido #{pedido_id} alterado para: {novo_status}"
        return False, "Pedido não encontrado"
    
    def obter_por_id(self, id_pedido):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id_pedido AS id, id_usuario, nome_usuario, nome_comida, quantidade, status, tempo_estimado_min
            FROM pedido
            WHERE id_pedido = %s
            LIMIT 1
        """, (id_pedido,))
        pedido = cursor.fetchone()
        conn.close()
        return pedido

pedido_db = PedidoModel()