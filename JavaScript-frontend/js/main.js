import { ApiService } from "./api.js";
import { AuthService } from "./auth.js";
import { Prato } from "./models/prato.js";
import { Pedido } from "./models/pedido.js";

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. ÁREA DO CLIENTE (index.html)
    // -------------------------------------------------------------
    const areaCardapio = document.getElementById('Cardapio');
    const formularioPedido = document.getElementById('formulario_pedido');
    const formRastreio = document.getElementById('formulario_rastreio');

    if (areaCardapio && formularioPedido) {
        carregarCardapioCliente();

        formularioPedido.addEventListener('submit', async (e) => {
            e.preventDefault();
            const novoPedido = new Pedido({
                nome_usuario: document.getElementById('nome_usuario').value,
                nome_comida: document.getElementById('nome_comida').value,
                quantidade: document.getElementById('quantidade').value
            });

            try {
                const res = await ApiService.criarPedido(novoPedido.toJSON());
                const dados = await res.json();
                if (res.ok) {
                    alert(`Pedido realizado com sucesso! O código do seu pedido é #${dados.id_pedido || dados.id || ''}`);
                    formularioPedido.reset();
                } else {
                    alert(dados.erro || 'Erro ao realizar o pedido.');
                }
            } catch (err) {
                console.error('Erro ao enviar o pedido:', err);
            }
        });
    }

    if (formRastreio) {
        formRastreio.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idPedido = document.getElementById('codigo_pedido_rastreio').value;
            const conterResultado = document.getElementById('resultado_rastreio');

            try {
                const dados = await ApiService.rastrearPedido(idPedido);
                if (dados && !dados.erro) {
                    conterResultado.innerHTML = `
                        <div class="status_rastreio">
                            <h4>Pedido #${dados.id}</h4>
                            <p><strong>Prato:</strong> ${dados.nome_comida}</p>
                            <p><strong>Status:</strong> <span class="identificacao_status">${dados.status || 'Aguardando'}</span></p>
                        </div>`;
                } else {
                    conterResultado.innerHTML = `<p class="erro">${dados.erro || 'Pedido não encontrado.'}</p>`;
                }
            } catch (err) {
                console.error('Erro no rastreamento:', err);
            }
        });
    }

    // -------------------------------------------------------------
    // 2. ÁREA ADMINISTRATIVA (admin.html)
    // -------------------------------------------------------------
    const formularioAdmin = document.getElementById('formulario_administrador');
    const listaPratos = document.getElementById('lista_pratos');

    if (formularioAdmin && listaPratos) {
        AuthService.verificarAcesso(['admin']);
        carregarTabelaAdmin();

        formularioAdmin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const novoPrato = new Prato({
                nome: document.getElementById('nome_prato').value,
                preco: document.getElementById('preco_prato').value,
                descricao: document.getElementById('descricao_prato').value
            });

            try {
                const res = await ApiService.criarPrato(novoPrato.toJSON());
                if (res.ok) {
                    alert('Prato cadastrado com sucesso!');
                    formularioAdmin.reset();
                    carregarTabelaAdmin();
                } else {
                    const dados = await res.json();
                    alert(dados.erro || 'Erro ao cadastrar prato.');
                }
            } catch (err) {
                console.error('Erro ao cadastrar prato:', err);
            }
        });
    }

    // -------------------------------------------------------------
    // 3. PAINEL DA COZINHA - KDS (Painelcozinha.html)
    // -------------------------------------------------------------
    const painelCozinheiro = document.getElementById('painel_cozinheiro');
    const formAgendamento = document.getElementById('formulario_agendamento');

    if (painelCozinheiro) {
        AuthService.verificarAcesso(['cozinha', 'admin']);
        carregarKDS();
        setInterval(carregarKDS, 4000);
    }

    if (formAgendamento) {
        carregarOpcoesBancadas();

        formAgendamento.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuarioSessao = AuthService.obterSessao();

            const dadosAgendamento = {
                id_bancada: document.getElementById('select_bancada').value,
                id_cozinheiro: usuarioSessao ? usuarioSessao.id : null,
                data_agendamento: document.getElementById('data_agendamento').value,
                hora_inicio: document.getElementById('hora_inicio').value,
                hora_fim: document.getElementById('hora_fim').value
            };

            try {
                const res = await ApiService.agendamentoBancada(dadosAgendamento);
                const dados = await res.json();

                if (res.ok) {
                    alert('Bancada agendada com sucesso!');
                    formAgendamento.reset();
                } else {
                    alert(dados.erro || 'Erro ao agendar bancada.');
                }
            } catch (err) {
                console.error('Erro ao agendar bancada:', err);
            }
        });
    }

    // -------------------------------------------------------------
    // 4. AUTENTICAÇÃO E REGISTO (login.html e cadastro.html)
    // -------------------------------------------------------------
    configurarFormulariosAuth();
});

// =================================================================
// FUNÇÕES AUXILIARES DE CARREGAMENTO & AÇÕES
// =================================================================

async function carregarCardapioCliente() {
    const areaCardapio = document.getElementById('Cardapio');
    try {
        const dados = await ApiService.obterCardapio();
        areaCardapio.innerHTML = '';

        dados.forEach(item => {
            const prato = new Prato(item);
            areaCardapio.innerHTML += `
                <div class="itemPratos">
                    <h3>${prato.nome} - R$ ${prato.preco}</h3>
                    <p>${prato.descricao}</p>
                    <button type="button" class="btn-selecionar-prato" data-nome="${prato.nome}">
                        Selecionar
                    </button>
                </div><hr>`;
        });

        document.querySelectorAll('.btn-selecionar-prato').forEach(botao => {
            botao.addEventListener('click', (e) => {
                const campoComida = document.getElementById('nome_comida');
                if (campoComida) campoComida.value = e.target.getAttribute('data-nome');
            });
        });
    } catch (err) {
        console.error('Erro ao carregar cardápio:', err);
    }
}

async function carregarTabelaAdmin() {
    const listaPratos = document.getElementById('lista_pratos');
    try {
        const dados = await ApiService.obterCardapio();
        listaPratos.innerHTML = '';

        dados.forEach(item => {
            const prato = new Prato(item);
            listaPratos.innerHTML += `
                <tr>
                    <td>${prato.nome}</td>
                    <td>R$ ${prato.preco}</td>
                    <td>${prato.descricao}</td>
                    <td><button onclick="deletarPrato(${prato.id})">Excluir</button></td>
                </tr>`;
        });
    } catch (err) {
        console.error('Erro ao carregar tabela admin:', err);
    }
}

async function carregarKDS() {
    const painelCozinheiro = document.getElementById('painel_cozinheiro');
    try {
        const dados = await ApiService.obterPedidos();
        painelCozinheiro.innerHTML = '';

        dados.forEach(item => {
            const pedido = new Pedido(item);
            painelCozinheiro.innerHTML += `
                <div class="card-pedido">
                    <h3>Pedido #${pedido.id || ''}</h3>
                    <p><strong>Cliente:</strong> ${pedido.nomeUsuario}</p>
                    <p><strong>Item:</strong> ${pedido.quantidade}x ${pedido.nomeComida}</p>
                    <p><strong>Status:</strong> ${pedido.status}</p>
                    <button type="button" onclick="marcarPronto(${pedido.id})">Pronto para entregar</button>
                </div><hr>`;
        });
    } catch (err) {
        console.error('Erro ao carregar KDS:', err);
    }
}

async function carregarOpcoesBancadas() {
    const selectBancada = document.getElementById('select_bancada');
    if (!selectBancada) return;

    try {
        const bancadas = await ApiService.obterBancada();
        selectBancada.innerHTML = '<option value="">Selecione uma Bancada</option>';

        bancadas.forEach(b => {
            selectBancada.innerHTML += `<option value="${b.id_bancada}">${b.identificacao} - ${b.equipamentos || ''}</option>`;
        });
    } catch (err) {
        console.error('Erro ao carregar bancadas:', err);
    }
}

function configurarFormulariosAuth() {
    const formLogin = document.getElementById('LoginForm');
    const formCadastro = document.getElementById('CadastroForm');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const credenciais = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            try {
                const res = await ApiService.login(credenciais);
                const dados = await res.json();
                if (res.ok) {
                    AuthService.salvarSessao(dados);
                    window.location.href = dados.redirect || 'index.html';
                } else {
                    alert(dados.erro || 'Falha ao realizar login.');
                }
            } catch (err) {
                console.error('Erro no login:', err);
            }
        });
    }

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };
            try {
                const res = await ApiService.cadastrarUsuario(usuario);
                if (res.ok) {
                    alert('Cadastro realizado com sucesso!');
                    window.location.href = 'login.html';
                } else {
                    const dados = await res.json();
                    alert(dados.erro || 'Erro no cadastro.');
                }
            } catch (err) {
                console.error('Erro no cadastro:', err);
            }
        });
    }
}

// Funções expostas globalmente para botões do DOM
window.deletarPrato = async (id) => {
    if (!confirm('Deseja remover este prato?')) return;
    const res = await ApiService.deletarPrato(id);
    if (res.ok) carregarTabelaAdmin();
};

window.marcarPronto = async (id) => {
    try {
        const res = await fetch(`http://127.0.0.1:5000/api/pedidos/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Pronto para entregar' })
        });
        if (res.ok) carregarKDS();
    } catch (err) {
        console.error('Erro ao atualizar status:', err);
    }
};