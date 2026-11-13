import { ApiService } from "./api.js";
import { AuthService } from "./auth.js";
import { Prato } from "./models/prato.js";
import { Pedido } from "./models/pedido.js";

document.addEventListener('DOMContentLoaded', () => {
    const formRastreio = document.getElementById('formulario_rastreio');
    configurarSelecaoCardsPopulares();
    carregarCardapioCliente();
    inicializarPaginaDetalhes();
    carregarPedidosClienteAutomatico();
    carregarDadosPerfil(); 

    if (formRastreio) {
        formRastreio.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputCodigo = document.getElementById('codigo_pedido_rastreio');
            const containerResultado = document.getElementById('resultado_rastreio');

            if (!inputCodigo || !containerResultado) return;

            const idPedido = inputCodigo.value.trim();

            try {
                const dados = await ApiService.rastrearPedido(idPedido);
                if (dados && !dados.erro) {
                    containerResultado.innerHTML = `
                        <div class="card-status-rastreio" style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #fff; margin-top: 10px;">
                            <h4>Pedido #${dados.id}</h4>
                            <p><strong>Prato:</strong> ${dados.nome_comida}</p>
                            <p><strong>Status Atual:</strong> <span class="badge-status" style="font-weight: bold; color: #d9534f;">${dados.status || 'Aguardando'}</span></p>
                            <p><strong>Tempo Estimado:</strong> ${dados.tempo_estimado_min ? dados.tempo_estimado_min + ' min' : 'Em análise pela cozinha'}</p>
                        </div>`;
                } else {
                    containerResultado.innerHTML = `<p class="erro" style="color: red; margin-top: 10px;">${dados.erro || 'Pedido não encontrado.'}</p>`;
                }
            } catch (err) {
                console.error('Erro no rastreamento do pedido:', err);
                containerResultado.innerHTML = `<p class="erro" style="color: red; margin-top: 10px;">Erro ao consultar status do pedido.</p>`;
            }
        });
    }

    const formularioAdmin = document.getElementById('formulario_administrador');
    const listaPratos = document.getElementById('lista_pratos');
    const formularioFuncionario = document.getElementById('formulario_funcionario');

    if (formularioAdmin) {
        AuthService.verificarAcesso(['admin']);
        if (listaPratos) carregarTabelaAdmin();

        formularioAdmin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome_prato').value;
            const descricao = document.getElementById('descricao_prato').value;
            const preco = document.getElementById('preco_prato').value;

            try {
                const prato = new Prato({ nome, descricao, preco, status: 'DISPONIVEL' });
                const res = await ApiService.criarPrato(prato.toJSON());
                if (res.ok) {
                    alert('Prato cadastrado com sucesso!');
                    formularioAdmin.reset();
                    if (listaPratos) carregarTabelaAdmin();
                    else window.location.href = '../admin.html';
                } else {
                    const dados = await res.json();
                    alert(dados.erro || 'Erro ao cadastrar prato.');
                }
            } catch (err) {
                console.error('Erro ao cadastrar prato:', err);
                alert('Falha na comunicação com o servidor backend.');
            }
        });
    }

    if (formularioFuncionario) {
        formularioFuncionario.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dadosFuncionario = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                cargo: document.getElementById('cargo').value
            };

            try {
                const res = await ApiService.cadastrarFuncionario(dadosFuncionario);
                const dados = await res.json();

                if (res.ok) {
                    alert(dados.mensagem || 'Funcionário cadastrado com sucesso!');
                    formularioFuncionario.reset();
                    window.location.href = '../admin.html';
                } else {
                    alert(dados.erro || 'Erro ao cadastrar funcionário.');
                }
            } catch (err) {
                console.error('Erro ao cadastrar funcionário:', err);
                alert('Falha na comunicação com o servidor backend.');
            }
        });
    }

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
                id_cozinheiro: usuarioSessao ? usuarioSessao.id : 1,
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
                    alert(dados.erro || 'Erro ao agendar bancada. Verifique os horários.');
                }
            } catch (err) {
                console.error('Erro ao agendar bancada:', err);
            }
        });
    }

    configurarFormulariosAuth();

    const formPerfil = document.getElementById('CadPerfilForm');
    const formEndereco = document.getElementById('CadEnderecoForm');

    if (formPerfil) {
        formPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dados = {
                nome: document.getElementById('nome').value,
                email: document.getElementById('email').value,
                telefone: document.getElementById('telefone').value
            };
            try {
                const res = await ApiService.atualizarPerfil(dados);
                const resposta = await res.json();
                if (res.ok) {
                    alert('Perfil atualizado com sucesso!');
                    window.location.href = 'perfil.html';
                } else {
                    alert(resposta.erro || 'Erro ao atualizar perfil.');
                }
            } catch (err) {
                console.error('Erro:', err);
            }
        });
    }

    if (formEndereco) {
        formEndereco.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dados = {
                cidade: document.getElementById('cidade').value,
                cep: document.getElementById('cep').value,
                bairro: document.getElementById('bairro').value,
                rua: document.getElementById('rua').value,
                numero: document.getElementById('numero').value
            };
            try {
                const res = await ApiService.salvarEndereco(dados);
                const resposta = await res.json();
                if (res.ok) {
                    alert('Endereço salvo com sucesso!');
                    window.location.href = 'perfil.html';
                } else {
                    alert(resposta.erro || 'Erro ao salvar endereço.');
                }
            } catch (err) {
                console.error('Erro:', err);
            }
        });
    }

    const formSeguranca = document.getElementById('SegurancaForm');
    if (formSeguranca) {
        formSeguranca.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuarioSessao = AuthService.obterSessao();
            if (!usuarioSessao) {
                alert('Faça login novamente.');
                window.location.href = 'login.html';
                return;
            }

            const novaSenha = document.getElementById('nova_senha').value;
            const confirmarSenha = document.getElementById('confirmar_nova_senha').value;
            const divErro = document.getElementById('mensagem_erro');

            if (novaSenha !== confirmarSenha) {
                if (divErro) divErro.innerText = 'As senhas não coincidem!';
                else alert('As senhas não coincidem!');
                return;
            }

            try {
                const res = await ApiService.alterarSenha({
                    id_usuario: usuarioSessao.id,
                    nova_senha: novaSenha
                });
                const dados = await res.json();

                if (res.ok) {
                    alert('Senha alterada com sucesso!');
                    window.location.href = 'perfil.html';
                } else {
                    if (divErro) divErro.innerText = dados.erro || 'Erro ao alterar senha.';
                }
            } catch (err) {
                console.error('Erro:', err);
            }
        });
    }

    const inputCep = document.getElementById('cep');
    if (inputCep) {
        inputCep.addEventListener('input', async () => {
            let cep = inputCep.value.replace(/\D/g, '');

            if (cep.length === 8) {
                try {
                    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const dados = await resposta.json();

                    if (!dados.erro) {
                        document.getElementById('rua').value = dados.logradouro || '';
                        document.getElementById('bairro').value = dados.bairro || '';
                        document.getElementById('cidade').value = dados.localidade || '';
                        document.getElementById('numero').focus();
                    } else {
                        alert('CEP não encontrado.');
                        document.getElementById('rua').value = '';
                        document.getElementById('bairro').value = '';
                        document.getElementById('cidade').value = '';
                    }
                } catch (err) {
                    console.error('Erro ao buscar o CEP:', err);
                }
            }
        });
    }

    const linkPerfil = document.querySelector('a[href="perfil.html"]');
    if (linkPerfil) {
        linkPerfil.addEventListener('click', (e) => {
            const usuarioSessao = AuthService.obterSessao();
            if (!usuarioSessao) {
                e.preventDefault();
                alert('Você precisa estar logado para aceder ao perfil.');
                window.location.href = 'login.html';
            }
        });
    }

    carregarEdicaoPratos();
    carregarEdicaoFuncionarios();
});

async function carregarCardapioCliente() {
    const areaCardapio = document.getElementById('restaurantes') || document.getElementById('Cardapio') || document.getElementById('cardapio');
    if (!areaCardapio) return;

    try {
        const dados = await ApiService.obterCardapio();
        let htmlCards = '<h2>Pedidos Populares (Clique para ver detalhes)</h2>';

        if (!Array.isArray(dados) || dados.length === 0) {
            areaCardapio.innerHTML = htmlCards + '<p>Nenhum prato disponível no momento.</p>';
            return;
        }

        dados.forEach(item => {
            const prato = new Prato(item);
            const avalDefault = "4.8 ★ (500+ avaliações) • 25-35 min";
            const imgDefault = "./imagens/prato_destaque.jpg";

            htmlCards += `
                <article class="card-restaurante card-clicavel" 
                    data-nome="${prato.nome}" 
                    data-preco="${prato.preco}" 
                    data-desc="${prato.descricao || 'Delicioso prato preparado com ingredientes frescos.'}" 
                    data-aval="${avalDefault}" 
                    data-img="${imgDefault}">
                    <img src="${imgDefault}" alt="${prato.nome}">
                    <div class="informacoes-restaurante">
                        <h3>${prato.nome}</h3>
                        <p>${avalDefault} • R$ ${prato.preco}</p>
                    </div>
                </article>`;
        });

        areaCardapio.innerHTML = htmlCards;
        configurarSelecaoCardsPopulares();
    } catch (err) {
        console.error('Erro ao carregar cardápio no cliente:', err);
    }
}

async function carregarTabelaAdmin() {
    const listaPratos = document.getElementById('lista_pratos');
    if (!listaPratos) return;

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
                    <td><button type="button" onclick="deletarPrato(${prato.id || prato.id_prato})">Excluir</button></td>
                </tr>`;
        });
    } catch (err) {
        console.error('Erro ao carregar tabela administrativa:', err);
    }
}

async function carregarKDS() {
    const painelCozinheiro = document.getElementById('painel_cozinheiro');
    if (!painelCozinheiro) return;

    try {
        const dados = await ApiService.obterPedidos();
        painelCozinheiro.innerHTML = '';

        if (!Array.isArray(dados) || dados.length === 0) {
            painelCozinheiro.innerHTML = '<p>Nenhum pedido na fila no momento.</p>';
            return;
        }

        dados.forEach(item => {
            const pedido = new Pedido(item);
            let botoesAcao = '';

            if (pedido.status === 'AGUARDANDO' || pedido.status === 'Pendente') {
                botoesAcao = `
                    <input type="number" id="tempo_${pedido.id}" placeholder="Minutos" min="1" style="width: 70px; padding: 5px;" />
                    <button type="button" onclick="iniciarPreparo(${pedido.id})">Iniciar Preparo</button>
                `;
            } else if (pedido.status === 'EM PREPARO') {
                botoesAcao = `
                    <button type="button" onclick="marcarPronto(${pedido.id})">Marcar como Pronto</button>
                `;
            } else if (pedido.status === 'PRONTO' || pedido.status === 'Pronto para entregar') {
                botoesAcao = `
                    <button type="button" onclick="marcarEntregue(${pedido.id})">Finalizar / Entregue</button>
                `;
            }

            painelCozinheiro.innerHTML += `
                <div class="card-pedido status-${pedido.status.toLowerCase().replace(/\s+/g, '-')}" style="padding: 15px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 8px;">
                    <h3>Pedido #${pedido.id || ''}</h3>
                    <p><strong>Cliente:</strong> ${pedido.nomeUsuario || 'Não informado'}</p>
                    <p><strong>Item:</strong> ${pedido.quantidade}x ${pedido.nomeComida}</p>
                    <p><strong>Status:</strong> <span class="badge-status">${pedido.status}</span></p>
                    <p><strong>Tempo Estimado:</strong> ${pedido.tempoEstimado ? pedido.tempoEstimado + ' min' : 'Não definido'}</p>
                    <div class="acoes-kds" style="margin-top: 10px;">${botoesAcao}</div>
                </div><hr>`;
        });
    } catch (err) {
        console.error('Erro ao carregar o KDS da cozinha:', err);
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
        console.error('Erro ao carregar lista de bancadas:', err);
    }
}

function configurarSelecaoCardsPopulares() {
    const cards = document.querySelectorAll('.card-restaurante');
    
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', () => {
            const usuarioSessao = AuthService.obterSessao();
            if (!usuarioSessao) {
                alert('Por favor, faça login para ver os detalhes e encomendar os pratos.');
                window.location.href = 'login.html';
                return;
            }

            const nome = card.getAttribute('data-nome') || card.querySelector('h3')?.innerText;
            const preco = card.getAttribute('data-preco') || '29.99';
            const desc = card.getAttribute('data-desc') || 'Delicioso prato preparado com ingredientes frescos e selecionados.';
            const aval = card.getAttribute('data-aval') || '4.8 ★ (500+ avaliações)';
            const img = card.getAttribute('data-img') || card.querySelector('img')?.getAttribute('src') || './imagens/prato_destaque.png';

            if (nome) {
                window.location.href = `detalhesPratos.html?nome=${encodeURIComponent(nome)}&preco=${encodeURIComponent(preco)}&desc=${encodeURIComponent(desc)}&aval=${encodeURIComponent(aval)}&img=${encodeURIComponent(img)}`;
            }
        });
    });
}

function inicializarPaginaDetalhes() {
    const nomeProdutoEl = document.getElementById('nome-produto');
    if (!nomeProdutoEl) return;

    const params = new URLSearchParams(window.location.search);
    const nome = params.get('nome');
    const preco = params.get('preco');
    const desc = params.get('desc');
    const aval = params.get('aval');
    const img = params.get('img');

    let qtd = 1;
    const spanQtd = document.getElementById('quantidade');
    const elPreco = document.getElementById('preco-produto');

    if (nome) {
        nomeProdutoEl.innerText = nome;
        const descEl = document.getElementById('descricao-produto');
        if (descEl) descEl.innerText = desc || '';
        
        const inputComida = document.getElementById('nome_comida');
        if (inputComida) inputComida.value = nome;
        
        const avalEl = document.getElementById('avaliacao-produto');
        if (avalEl) avalEl.innerText = aval || '';

        const imgEl = document.getElementById('imagem-produto');
        if (imgEl && img) imgEl.src = img;

        const precoUnitario = parseFloat(preco) || 0;
        
        function atualizarPrecoTotal() {
            if (elPreco) elPreco.innerText = `R$ ${(precoUnitario * qtd).toFixed(2)}`;
        }

        atualizarPrecoTotal();

        const btnAumentar = document.getElementById('aumentar');
        const btnDiminuir = document.getElementById('diminuir');

        if (btnAumentar) {
            btnAumentar.addEventListener('click', () => {
                qtd++;
                if (spanQtd) spanQtd.innerText = qtd;
                atualizarPrecoTotal();
            });
        }

        if (btnDiminuir) {
            btnDiminuir.addEventListener('click', () => {
                if (qtd > 1) {
                    qtd--;
                    if (spanQtd) spanQtd.innerText = qtd;
                    atualizarPrecoTotal();
                }
            });
        }
    }

    const btnAdicionar = document.getElementById('adicionar-produto');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', async () => {
            const usuarioSessao = AuthService.obterSessao();
            
            if (!usuarioSessao) {
                alert('Você precisa estar logado para fazer um pedido.');
                window.location.href = 'login.html';
                return;
            }

            const nomeUsuario = usuarioSessao.username || usuarioSessao.nome || 'Cliente';
            const nomeComida = document.getElementById('nome_comida')?.value || nome;

            const novoPedido = new Pedido({
                id_usuario: usuarioSessao.id,
                nome_usuario: nomeUsuario,
                nome_comida: nomeComida,
                quantidade: qtd
            });

            try {
                const res = await ApiService.criarPedido(novoPedido.toJSON());
                const dados = await res.json();

                if (res.ok) {
                    alert(`Pedido realizado com sucesso! O código do pedido é #${dados.id_pedido || dados.id || ''}`);
                    window.location.href = 'pedidos_cliente.html';
                } else {
                    alert(dados.erro || 'Erro ao efetuar o pedido.');
                }
            } catch (err) {
                console.error('Erro:', err);
                alert('Erro na comunicação com o servidor backend.');
            }
        });
    }
}

async function carregarPedidosClienteAutomatico() {
    const container = document.getElementById('lista_pedidos_cliente');
    if (!container) return;

    try {
        const pedidos = await ApiService.obterPedidos();

        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            container.innerHTML = `
                <div class="vazio" style="grid-column: 1 / -1; text-align:center; padding:30px;">
                    <h2>Nenhum pedido encontrado</h2>
                    <p>Você ainda não realizou nenhum pedido no Sushi Zen.</p>
                </div>`;
            return;
        }

        let htmlCards = '';
        pedidos.forEach(p => {
            const statusClasse = p.status ? p.status.toLowerCase().replace(/\s+/g, '-') : 'aguardando';
            const tempoTexto = p.tempo_estimado_min || p.tempoEstimado ? `${p.tempo_estimado_min || p.tempoEstimado} min` : 'Em análise pela cozinha';
            
            htmlCards += `
                <article class="card-pedido-cliente" style="background:#111; border:1px solid #A8893F; border-radius:12px; padding:20px; margin-bottom:15px; box-shadow:0 4px 15px rgba(0,0,0,0.5);">
                    <div class="card-pedido-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222; padding-bottom:10px; margin-bottom:12px;">
                        <h3 style="color:#D9BC78; font-size:1.2rem;">Pedido #${p.id || p.id_pedido}</h3>
                        <span class="status status-${statusClasse}" style="padding:4px 10px; border-radius:999px; font-size:0.8rem; font-weight:600; background:#211B10; color:#D9BC78; border:1px solid #A8893F;">${p.status || 'AGUARDANDO'}</span>
                    </div>
                    <div class="card-pedido-corpo" style="display:flex; flex-direction:column; gap:6px;">
                        <p style="color:#EEEEEE; font-size:0.95rem;"><strong>Prato:</strong> ${p.quantidade || 1}x ${p.nome_comida || p.nomeComida}</p>
                        <p style="color:#EEEEEE; font-size:0.95rem;"><strong>Cliente:</strong> ${p.nome_usuario || p.nomeUsuario || 'Cliente'}</p>
                        <div class="card-pedido-tempo" style="margin-top:8px; padding:8px 12px; background:#1A1813; border-radius:8px; color:#D9BC78; font-size:0.9rem; display:inline-block;">
                            <strong>Tempo Estimado:</strong> ${tempoTexto}
                        </div>
                    </div>
                </article>`;
        });

        container.innerHTML = htmlCards;
    } catch (err) {
        console.error('Erro ao carregar pedidos do cliente:', err);
        container.innerHTML = `
            <div class="vazio" style="grid-column: 1 / -1; text-align:center; padding:30px;">
                <h2>Erro de conexão</h2>
                <p>Não foi possível carregar seus pedidos no momento.</p>
            </div>`;
    }
}

function configurarFormulariosAuth() {
    const formLogin = document.getElementById('LoginForm');
    const formCadastro = document.getElementById('CadastroForm');
    const divErro = document.getElementById('mensagem_erro');

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const credenciais = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const res = await ApiService.login(credenciais);
                const dados = await res.json();

                if (res.ok) {
                    AuthService.salvarSessao(dados);
                    alert('Login realizado com sucesso!');
                    window.location.href = dados.redirect || 'index.html';
                } else {
                    if (divErro) divErro.innerText = dados.erro || 'Falha na autenticação.';
                    else alert(dados.erro || 'Falha na autenticação.');
                }
            } catch (err) {
                console.error('Erro ao realizar login:', err);
            }
        });
    }

if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const senha = document.getElementById('password').value;
            const confirmarSenha = document.getElementById('confirm_password').value;

            if (senha !== confirmarSenha) {
                if (divErro) divErro.innerText = 'As senhas não coincidem!';
                else alert('As senhas não coincidem!');
                return;
            }

            if (senha.length < 15 || senha.length > 128) {
                if (divErro) divErro.innerText = 'A senha deve ter entre 15 e 128 caracteres.';
                else alert('A senha deve ter entre 15 e 128 caracteres.');
                return;
            }

            if (!/[A-Z]/.test(senha)) {
                if (divErro) divErro.innerText = 'A senha deve conter pelo menos uma letra maiúscula.';
                else alert('A senha deve conter pelo menos uma letra maiúscula.');
                return;
            }

            if (!/[a-z]/.test(senha)) {
                if (divErro) divErro.innerText = 'A senha deve conter pelo menos uma letra minúscula.';
                else alert('A senha deve conter pelo menos uma letra minúscula.');
                return;
            }

            if (!/\d/.test(senha)) {
                if (divErro) divErro.innerText = 'A senha deve conter pelo menos um número.';
                else alert('A senha deve conter pelo menos um número.');
                return;
            }

            if (!/[^A-Za-z0-9]/.test(senha)) {
                if (divErro) divErro.innerText = 'A senha deve conter pelo menos um caractere especial.';
                else alert('A senha deve conter pelo menos um caractere especial.');
                return;
            }

            const telefoneInput = document.getElementById('telefone').value;
            const telefoneLimpo = telefoneInput.replace(/\D/g, '');

            if (telefoneLimpo.length !== 11) {
                if (divErro) divErro.innerText = 'O telefone deve ter exatamente 11 dígitos.';
                else alert('O telefone deve ter exatamente 11 dígitos.');
                return;
            }

            const usuario = {
                email: document.getElementById('email').value,
                username: document.getElementById('username').value,
                telefone: telefoneLimpo,
                endereco: document.getElementById('endereco').value,
                password: senha
            };

            try {
                const res = await ApiService.cadastrarUsuario(usuario);
                const dados = await res.json();

                if (res.ok) {
                    alert('Cadastro realizado com sucesso!');
                    window.location.href = 'login.html';
                } else {
                    if (divErro) divErro.innerText = dados.erro || 'Erro ao realizar cadastro.';
                    else alert(dados.erro || 'Erro ao realizar cadastro.');
                }
            } catch (err) {
                console.error('Erro ao realizar cadastro:', err);
            }
        });
    }

    const inputTelefone = document.getElementById('telefone');
    if (inputTelefone) {
        inputTelefone.addEventListener('input', () => {
            let valor = inputTelefone.value.replace(/\D/g, '');
            
            if (valor.length > 11) {
                valor = valor.slice(0, 11);
            }
            
            inputTelefone.value = valor;
        });
    }
}

async function carregarEdicaoPratos() {
    const container = document.getElementById('lista_pratos');
    const inputBusca = document.getElementById('campo_busca_prato');
    if (!container) return;

    try {
        const pratos = await ApiService.obterCardapio();
        
        function renderizar(lista) {
            if (!lista || lista.length === 0) {
                container.innerHTML = '<p>Nenhum prato encontrado.</p>';
                return;
            }

            let html = '<table border="1" style="width:100%; text-align:left; border-collapse:collapse; background:#fff; padding:10px;">';
            html += '<tr style="background:#f4f4f4;"><th>ID</th><th>Nome</th><th>Preço</th><th>Ação</th></tr>';

            lista.forEach(p => {
                const pratoId = p.id || p.id_prato;
                html += `
                    <tr>
                        <td style="padding:8px;">#${pratoId}</td>
                        <td style="padding:8px;">${p.nome}</td>
                        <td style="padding:8px;">R$ ${p.preco}</td>
                        <td style="padding:8px;">
                            <button class="btn-excluir-prato" data-id="${pratoId}" style="background:#e74c3c; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Excluir</button>
                        </td>
                    </tr>`;
            });
            html += '</table>';
            container.innerHTML = html;

            document.querySelectorAll('.btn-excluir-prato').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if (confirm(`Deseja realmente remover o prato #${id}?`)) {
                        const res = await ApiService.deletarPrato(id);
                        if (res.ok) {
                            alert('Prato removido com sucesso!');
                            carregarEdicaoPratos();
                        } else {
                            alert('Erro ao remover o prato.');
                        }
                    }
                });
            });
        }

        renderizar(pratos);

        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => {
                const termo = e.target.value.toLowerCase();
                const filtrados = pratos.filter(p => p.nome.toLowerCase().includes(termo));
                renderizar(filtrados);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar pratos para edição:', err);
        container.innerHTML = '<p>Erro ao carregar dados do servidor.</p>';
    }
}

async function carregarEdicaoFuncionarios() {
    const container = document.getElementById('lista_funcionarios');
    const inputBusca = document.getElementById('campo_busca_func');
    if (!container) return;

    try {
        const resposta = await fetch('http://127.0.0.1:5000/api/admin/funcionarios');
        const funcionarios = await resposta.json();

        function renderizar(lista) {
            if (!lista || lista.length === 0) {
                container.innerHTML = '<p>Nenhum funcionário encontrado.</p>';
                return;
            }

            let html = `
                <table border="1" style="width:100%; text-align:left; border-collapse:collapse; background:#fff;">
                    <tr style="background:#f4f4f4;">
                        <th style="padding:10px;">ID</th>
                        <th style="padding:10px;">Usuário</th>
                        <th style="padding:10px;">Cargo</th>
                    </tr>`;

            lista.forEach(f => {
                html += `
                    <tr>
                        <td style="padding:10px;">#${f.id}</td>
                        <td style="padding:10px;">${f.username}</td>
                        <td style="padding:10px; text-transform:capitalize;">${f.cargo}</td>
                    </tr>`;
            });

            html += '</table>';
            container.innerHTML = html;
        }

        renderizar(funcionarios);

        if (inputBusca) {
            inputBusca.addEventListener('input', (e) => {
                const termo = e.target.value.toLowerCase();
                const filtrados = funcionarios.filter(f => 
                    f.username.toLowerCase().includes(termo) || f.cargo.toLowerCase().includes(termo)
                );
                renderizar(filtrados);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar funcionários:', err);
        container.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

async function carregarDadosPerfil() {
    const perfilUsernameEl = document.getElementById('perfil_username');
    if (!perfilUsernameEl) return;

    const usuarioSessao = AuthService.obterSessao();
    if (!usuarioSessao || !usuarioSessao.id) {
        alert('Você precisa estar logado para aceder ao perfil.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:5000/api/perfil/${usuarioSessao.id}`);
        const dados = res.ok ? await res.json() : usuarioSessao;

        document.getElementById('perfil_username').innerText = dados.username || 'Usuário';
        document.getElementById('perfil_email').innerText = dados.email || 'Não informado';
        
        document.getElementById('info_username').innerText = dados.username || '-';
        document.getElementById('info_email').innerText = dados.email || '-';
        
        const telEl = document.getElementById('info_telefone');
        if (telEl) telEl.innerText = dados.telefone || 'Não cadastrado';
        
        const endEl = document.getElementById('info_endereco');
        if (endEl) endEl.innerText = dados.rua || dados.endereco || 'Não cadastrado';

    } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
        document.getElementById('perfil_username').innerText = usuarioSessao.username || 'Usuário';
        document.getElementById('perfil_email').innerText = usuarioSessao.email || '-';
        document.getElementById('info_username').innerText = usuarioSessao.username || '-';
        document.getElementById('info_email').innerText = usuarioSessao.email || '-';
    }

    const btnSair = document.getElementById('botao_sair_conta');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.limparSessao();
            alert('Sessão encerrada!');
            window.location.href = 'login.html';
        });
    }
}

window.deletarPrato = async (id) => {
    if (!confirm('Tem certeza de que deseja excluir este prato?')) return;
    try {
        const res = await ApiService.deletarPrato(id);
        if (res.ok) {
            carregarTabelaAdmin();
        } else {
            const dados = await res.json();
            alert(dados.erro || 'Erro ao deletar prato.');
        }
    } catch (err) {
        console.error('Erro ao excluir prato:', err);
    }
};

window.iniciarPreparo = async (id) => {
    const inputTempo = document.getElementById(`tempo_${id}`);
    const tempoEstimado = inputTempo ? parseInt(inputTempo.value, 10) : 0;

    if (!tempoEstimado || tempoEstimado <= 0) {
        alert('Por favor, defina o tempo estimado em minutos antes de iniciar o preparo.');
        return;
    }

    try {
        const res = await ApiService.atualizarStatusPedido(id, 'EM PREPARO', tempoEstimado);
        const dados = await res.json();

        if (res.ok) {
            carregarKDS();
        } else {
            alert(dados.erro || 'Erro ao iniciar o preparo do pedido.');
        }
    } catch (err) {
        console.error('Erro na requisição HTTP (iniciarPreparo):', err);
        alert('Falha na comunicação com o servidor backend.');
    }
};

window.marcarPronto = async (id) => {
    try {
        const res = await ApiService.atualizarStatusPedido(id, 'PRONTO');
        const dados = await res.json();

        if (res.ok) {
            carregarKDS();
        } else {
            alert(dados.erro || 'Erro ao atualizar status do pedido.');
        }
    } catch (err) {
        console.error('Erro na requisição HTTP (marcarPronto):', err);
        alert('Falha na comunicação com o servidor backend.');
    }
};

window.marcarEntregue = async (id) => {
    try {
        const res = await ApiService.atualizarStatusPedido(id, 'ENTREGUE');
        if (res.ok) carregarKDS();
    } catch (err) {
        console.error('Erro ao finalizar pedido:', err);
    }

    const formEndereco = document.getElementById('CadEnderecoForm');
    
    if (formEndereco) {
        const usuarioSessao = AuthService.obterSessao();
        if (usuarioSessao && usuarioSessao.id) {
            fetch(`http://127.0.0.1:5000/api/perfil/${usuarioSessao.id}`)
                .then(res => res.json())
                .then(dados => {
                    if (dados) {
                        document.getElementById('cep').value = dados.cep || '';
                        document.getElementById('rua').value = dados.rua || '';
                        document.getElementById('bairro').value = dados.bairro || '';
                        document.getElementById('cidade').value = dados.localidade || dados.cidade || '';
                        document.getElementById('numero').value = dados.numero || '';
                    }
                })
                .catch(err => console.error(err));
        }
    }
};
