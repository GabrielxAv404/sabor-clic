export class AuthService {
    static salvarSessao(usuario) {
        const sessaoComExpiracao = {
            ...usuario,
            _expiracao: Date.now() + 5 * 60 * 1000
        };
        localStorage.setItem('sabor_usuario', JSON.stringify(sessaoComExpiracao));
    }

    static obterSessao() {
        const dadosStr = localStorage.getItem('sabor_usuario');
        if (!dadosStr) return null;

        const dados = JSON.parse(dadosStr);
        if (dados._expiracao && Date.now() > dados._expiracao) {
            this.encerrarSessao();
            return null;
        }

        return dados;
    }

    static encerrarSessao() {
        localStorage.removeItem('sabor_usuario');
        window.location.href = 'login.html';
    }

    static verificarAcesso(cargosPermitidos = []) {
        const usuario = this.obterSessao();

        if (!usuario) {
            window.location.href = 'login.html';
            return;
        }

        if (cargosPermitidos.length > 0 && !cargosPermitidos.includes(usuario.cargo)) {
            window.location.href = 'nao_autorizado.html';
        }
    }
}