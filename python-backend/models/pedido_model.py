class PedidoModel:
    def __init__(self):
        self.pedidos = []

    def obter_todos(self):
        return self.pedidos

    def adicionar(self, novo_pedido):
        self.pedidos.append(novo_pedido)
        return novo_pedido

pedido_db = PedidoModel()