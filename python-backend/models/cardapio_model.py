class CardapioModel:
    def __init__(self):
        self.cardapio = [
            {"nome": "X-Burger", "preco": 25.00, "descricao": "Pão, hambúrguer 180g e queijo"},
            {"nome": "Suco Natural", "preco": 8.00, "descricao": "Laranja 500ml"}
        ]

    def obter_todos(self):
        return self.cardapio

    def adicionar(self, novo_prato):
        self.cardapio.append(novo_prato)
        return novo_prato

cardapio_db = CardapioModel()