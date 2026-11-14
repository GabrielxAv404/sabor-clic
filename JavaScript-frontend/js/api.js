const API_URL = 'http://127.0.0.1:5000/api'

export class ApiService {
    static async obterCardapio() {
        const res = await fetch(`${API_URL}/cardapio`)
        return await res.json()
    }

    static async criarPrato(dadosPrato) {
        return await fetch(`${API_URL}/cardapio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPrato)
        })
    }

    static async deletarPrato(id) {
        return await fetch(`${API_URL}/cardapio/${id}`, { method: 'DELETE' })
    }

    static async obterPedidos() {
        const res = await fetch(`${API_URL}/pedidos`)
        return await res.json()
    }

    static async criarPedido(dadospedido) {
        return await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadospedido)
        })
    }

    static async rastrearPedido(idPedido) {
        const res = await fetch(`${API_URL}/pedidos/${idPedido}`)
        return await res.json()
    }

    static async obterHistorico(idCliente) {
        const res = await fetch(`${API_URL}/pedidos/cliente/${idCliente}`)
        return await res.json()
    }

    static async obterBancada() {
        const res = await fetch(`${API_URL}/bancadas`)
        return await res.json()
    }

    static async agendamentoBancada(dadosAgendamento) {
        return await fetch(`${API_URL}/bancadas/agendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAgendamento)
        })
    }

    static async obterAgendamento(idcozinheiro) {
        const res = await fetch(`${API_URL}/bancadas/agendamentos/${idcozinheiro}`)
        return await res.json()
    }

    static async login(credenciais) {
        return await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credenciais)
        })
    }
    static async cadastrarUsuario(dadosusuario) {
        return await fetch(`${API_URL}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosusuario)
        })
    }

    static async cadastrarFuncionario(dadosfuncionario) {
        return await fetch(`${API_URL}/admin/cadastrar-funcionario`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosfuncionario)
        })
    }
    static async atualizarPerfil(dadosPerfil) {
    return await fetch(`${API_URL}/perfil/editar`, {
        method: 'POST', // ou PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPerfil)
    });
}

static async salvarEndereco(dadosEndereco) {
    return await fetch(`${API_URL}/endereco`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosEndereco)
    });
}

async atualizarStatusPedido(idPedido, status, tempoEstimado = null) {
    return await fetch(`http://127.0.0.1:5000/api/pedidos/${idPedido}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            status: status, 
            tempo_estimado: tempoEstimado 
        })
    });
}
    static async alterarSenha(dadosSenha) {
        return await fetch(`${API_URL}/seguranca/senha`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosSenha)
        });
    }

    static async atualizarEndereco(dadosEndereco) {
        return await fetch(`${API_URL}/endereco/atualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEndereco)
        });
    }
}
