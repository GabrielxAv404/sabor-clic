from flask import Flask
from flask_cors import CORS

from controllers.pedido_controller import pedido_blueprint
from controllers.cardapio_controller import cardapio_blueprint
from controllers.login_usuario_controller import LoginUsuario_blueprint
from controllers.bancada_controller import bancada_blueprint

app = Flask(__name__)
CORS(app)


app.register_blueprint(pedido_blueprint)
app.register_blueprint(cardapio_blueprint)
app.register_blueprint(LoginUsuario_blueprint)
app.register_blueprint(bancada_blueprint)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)