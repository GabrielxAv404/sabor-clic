export class AuthService {
    static salvarSessao(usuario) {
        const sessaoComExpiracao = {
            ...usuario,
            _expiracao: Date.now() + 5 * 60 * 1000 // 5 minutos
        };
        localStorage.setItem('sabor_usuario', JSON.stringify(sessaoComExpiracao));
    }

    static obterSessao() {
        const dadosStr = localStorage.getItem('sabor_usuario');
        if (!dadosStr) return null;

        const dados = JSON.parse(dadosStr);
        if (dados._expiracao && Date.now() > dados._expiracao) {
            this.encerrarSessaoPorExpiracao();
            return null;
        }

        return dados;
    }

    static async verificarSessaoServidor() {
        try {
            const resposta = await fetch('http://127.0.0.1:5000/api/verificar-sessao', {
                method: 'GET',
                credentials: 'include' 
            });
            if (!resposta.ok) {
                this.encerrarSessao();
                return false;
            }
            const dados = await resposta.json();
            return dados.autenticado;
        } catch (err) {
            console.error('Erro ao validar sessão no servidor:', err);
            return false;
        }
    }

    static encerrarSessao() {
        localStorage.removeItem('sabor_usuario');
        fetch('http://127.0.0.1:5000/api/logout', { method: 'POST', credentials: 'include' });
        window.location.href = 'login.html';
    }

    static encerrarSessaoPorExpiracao() {
        localStorage.removeItem('sabor_usuario');
        fetch('http://127.0.0.1:5000/api/logout', { method: 'POST', credentials: 'include' });
        window.location.href = 'login.html?expirado=true';
    }

    static async verificarAcesso(cargosPermitidos = []) {
        const usuarioLocal = this.obterSessao();

        if (!usuarioLocal) {
            window.location.href = 'login.html';
            return;
        }

        const servidorAutenticado = await this.verificarSessaoServidor();
        if (!servidorAutenticado) {
            window.location.href = 'login.html?expirado=true';
            return;
        }

        if (cargosPermitidos.length > 0 && !cargosPermitidos.includes(usuarioLocal.cargo)) {
            window.location.href = 'nao_autorizado.html';
        }
    }
}