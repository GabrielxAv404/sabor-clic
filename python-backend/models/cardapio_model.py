from database import get_db_connection

class CardapioModel:
    def obter_todos(self):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id_prato AS id, nome, preco, descricao, status FROM prato WHERE status = 'DISPONIVEL'")
        pratos = cursor.fetchall()
        conn.close()
        return pratos

    def adicionar(self, novo_prato):
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO prato (nome, preco, descricao, status) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (
            novo_prato['nome'],
            novo_prato['preco'],
            novo_prato['descricao'],
            novo_prato.get('status', 'DISPONIVEL')
        ))
        conn.commit()
        id_criado = cursor.lastrowid
        conn.close()
        novo_prato['id'] = id_criado
        return novo_prato

    def deletar(self, prato_id):
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM prato WHERE id_prato = %s", (prato_id,))
        linhas_afetadas = cursor.rowcount
        conn.commit()
        conn.close()

        if linhas_afetadas > 0:
            return True, "Prato removido com sucesso!"
        return False, "Prato não encontrado"

cardapio_db = CardapioModel()