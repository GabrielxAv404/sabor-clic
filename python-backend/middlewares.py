from flask import request, jsonify, g
import time

def configurar_middlewares(app):
    
    @app.before_request
    def interceptar_requisicoes():
        g.inicio = time.time()
        print(f"[SUSHIZEN MIDDLEWARE] Acedendo à rota: {request.path} | Método: {request.method}")

    @app.after_request
    def processar_resposta(response):
        """
        Middleware executado após a rota processar a requisição.
        Injeta cabeçalhos personalizados (mensagens) em todas as respostas enviadas ao front-end.
        """
        if hasattr(g, 'inicio'):
            tempo_decorrido = time.time() - g.inicio
            response.headers['X-Tempo-Resposta'] = f"{tempo_decorrido:.4f}s"
            
        response.headers['X-Mensagem-Sistema'] = 'Bem-vindo ao Sabor & Clic - Sistema Operacional Ativo'
            
        response.headers['Content-Type'] = response.headers.get('Content-Type', 'application/json; charset=utf-8')
        return response