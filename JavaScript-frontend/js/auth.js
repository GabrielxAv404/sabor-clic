export class AuthService {
    static salvarSessao(usuario) {
        localStorage.setItem('sabor_usuario', JSON.stringify(usuario))
    }

    static obterSessao() {
        const dados = localStorage.getItem('sabor_usuario')
        return dados ? JSON.parse(dados) : null
    }

    static encerrarSessao() {
        localStorage.removeItem('sabor_usuario')
        window.location.href = 'login.html'
    }

    static verificarAcesso(cargosPermitidos = []) {
        const usuario = this.obterSessao()

        if (!usuario) {
            window.location.href = 'login.html'
            return
        }

        if (cargosPermitidos.length > 0 && !cargosPermitidos.includes(usuario.cargo)) {
            alert('Acesso negado: O seu perfil não tem permissão para aceder a esta área')
            window.location.href = usuario.redirect || 'index.html'
        }
    }
}