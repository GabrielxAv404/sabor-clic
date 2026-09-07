sabor-e-clic-projeto/
│
├── backend-flask/                # 🐍 API Back-end em Python (Padrão MVC)
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py         # Entidades (Prato, Pedido, Usuario)
│   │   ├── controllers/
│   │   │   └── main_controller.py# Lógica de negócio e preparação de dados para JSON
│   │   └── views/
│   │       └── routes.py         # Endpoints RESTful que respondem em JSON
│   ├── requirements.txt          # Dependências (Flask)
│   └── run.py                    # Script para subir a API Flask
│
├── frontend-js/                  # 🟨 Front-end e Interfaces HTML
│   ├── js/
│   │   └── main.js               # Manipulação do DOM, validações e dados simulados
│   │
│   ├── index.html                # Visão do Cliente: Cardápio Digital e Carrinho
│   ├── admin.html                # Visão do Administrador: Gestão do Catálogo de Pratos
│   └── kds.html                  # Visão do Cozinheiro: Painel de Pedidos da Cozinha