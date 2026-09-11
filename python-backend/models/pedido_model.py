class PedidoModel:
    def __init__(self):
        self.pedidos = []

    def obter_todos(self):
        return self.pedidos

    def adicionar(self, novo_pedido):
        self.pedidos.append(novo_pedido)
        return novo_pedido
    def atulizar_status(self, pedido_id, novo_status):
        for pedido in self.pedidos:

            if pedido['id'] == pedido_id:
                pedido['status'] = novo_status
                return True, f"pedido #{pedido_id} alterado para: {novo_status}"
        return False, "Pedido não encontrado"

pedido_db = PedidoModel()