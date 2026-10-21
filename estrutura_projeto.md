Sabor-e-Click/
├── JavaScript-frontend/
│   ├── css/
│   │   ├── admin.css
│   │   ├── cadastro.css
│   │   ├── index.css
│   │   ├── login.css
│   │   └── painelcozinha.css
│   ├── js/
│   │   ├── models/
│   │   │   ├── Prato.js
│   │   │   └── Pedido.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── main.js
│   ├── admin.html
│   ├── cadastro.html
│   ├── index.html
│   ├── login.html
│   └── Painelcozinha.html
│
└── python-backend/
    ├── controllers/
    │   ├── cardapio_controller.py
    │   ├── login_usuario_controller.py
    │   └── pedido_controller.py
    ├── models/
    │   ├── cardapio_model.py
    │   ├── login_usuario_model.py
    │   └── pedido_model.py
    ├── config.py             <-- NOVO
    ├── database.py           <-- NOVO
    ├── 01_modelo_fisico.sql  <-- NOVO
    ├── app.py
    └── requirements.txt

mexer no index.html







///////////////////////////////////////////////////////////////////////////////////
    //codigo anterior do main.js

    const API_URL = 'http://127.0.0.1:5000/api'

document.addEventListener('DOMContentLoaded', async () => {
    const areacardapio = document.getElementById('Cardapio')
    const formulariopedido = document.getElementById('formulario_pedido')
    const formulariofuncionario = document.getElementById('formulario_funcionario')

    if (areacardapio && formulariopedido) {

        const resposta = await fetch(`${API_URL}/cardapio`)
        const pratos = await resposta.json()

        areacardapio.innerHTML = ''

        pratos.forEach((prato) => {
            areacardapio.innerHTML += `
            <div class="itemPratos"> 
            <h3>${prato.nome} - R$ ${prato.preco}</h3>
            <p>${prato.descricao}</p>
            <button type="button" onclick="document.getElementById('nome_comida').value = '${prato.nome}'">
                Selecionar
            </button>
            </div>
            <hr>`
        })

        formulariopedido.addEventListener("submit", async (event) => {
            event.preventDefault()

            const pedido = {
                nome_usuario: document.getElementById('nome_usuario').value,
                nome_comida: document.getElementById('nome_comida').value,
                quantidade: document.getElementById('quantidade').value
            }

            const resposta = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            })

            if (resposta.ok) {
                alert('Pedido realizado com sucesso!')
                formulariopedido.reset()
            }
        })
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    const formulario_admin = document.getElementById('formulario_administrador')
    const listaPratos = document.getElementById('lista_pratos')

    if (formulario_admin && listaPratos) {

        async function carregarTabela() {
            const buscar = await fetch(`${API_URL}/cardapio`)
            const pratosbuscas = await buscar.json()

            listaPratos.innerHTML = ''

            pratosbuscas.forEach((buscasItempratos) => {
                listaPratos.innerHTML += `
                <tr>
                    <td>${buscasItempratos.nome}</td>
                    <td>R$ ${buscasItempratos.preco}</td>
                    <td>${buscasItempratos.descricao}</td>
                </tr>`
            })
        }

        carregarTabela()

        formulario_admin.addEventListener('submit', async (event) => {
            event.preventDefault()

            const novoPrato = {
                nome: document.getElementById('nome_prato').value,
                preco: parseFloat(document.getElementById('preco_prato').value),
                descricao: document.getElementById('descricao_prato').value
            }

            const resposta = await fetch(`${API_URL}/cardapio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoPrato)
            })

            if (resposta.ok) {
                alert('Prato cadastrado com sucesso!')
                formulario_admin.reset()
                carregarTabela()
            }
        })
    }
    if (formulariofuncionario) {
        formulariofuncionario.addEventListener("submit", async (Event) => {
            Event.preventDefault()
            const funcionario = {
                username: document.getElementById("username").value,
                password: document.getElementById('password').value,
                cargo: document.getElementById('cargo').value
            }

            try {
                const resposta = await fetch(`${API_URL}/admin/cadastrar-funcionario`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(funcionario)
                })
                const dados = await resposta.json()
                if (resposta.ok) {
                    alert(dados.mensagem)
                    formulariofuncionario.reset()
                }
                else {
                    alert(dados.erro || 'Erro ao cadastrar funcinário')
                }
            } catch (erro) {
                console.error("erro ao cadastrar funcionario")
            }
        })
    }
})
async function deletarPrato(id) {
    if (!confirm('tem certeza que deseja enclueir este Prato')) return
    try {
        const resposta = await fetch(`${API_URL}/cardapio/${id}`, {
            method: 'DELETE',
        })
        const dados = await resposta.json()
        if (resposta.ok) {
            alert(dados.mensagem)
            location.reload()
        }
        else {
            alert(dados.erro || 'Erro ao  deletar prato')
        }
    } catch (erro) {
        console.error("Erro ao deletar prato", erro)
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    const painelCozinheiro = document.getElementById('painel_cozinheiro')
    if (painelCozinheiro) {

        async function carregarPedidos() {
            const resposta = await fetch(`${API_URL}/pedidos`)
            const pedidos = await resposta.json()

            painelCozinheiro.innerHTML = ''
            pedidos.forEach((pedido) => {
                painelCozinheiro.innerHTML += `
                <div class="card-pedido">
                <h3>Tipo: ${pedido.tipo_pedido}</h3>
                <p>Cliente: ${pedido.nome_usuario}</p>
                <p>Item Prato: ${pedido.quantidade}x ${pedido.nome_comida}</p>
                </div>
                <hr>`
            })
        }

        carregarPedidos()

        setInterval(carregarPedidos, 3000)
    }
})

document.addEventListener('DOMContentLoaded', () => {
    const formularioLogin = document.getElementById('LoginForm')
    const formularioCadastro = document.getElementById('CadastroForm')

    if (formularioLogin) {
        formularioLogin.addEventListener('submit', async (event) => {
            event.preventDefault()

            const usuario = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };

            const mensagemErro = document.getElementById("mensagem_erro");
            if (mensagemErro) mensagemErro.innerText = ''

            try {
                const resposta = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuario)
                });

                const dados = await resposta.json()

                if (resposta.ok) {
                    alert('Login realizado com sucesso!')
                    formularioLogin.reset()
                    if (dados.redirect) {
                        window.location.href = dados.redirect
                    }
                } else {
                    if (mensagemErro) {
                        mensagemErro.innerText = dados.erro || 'Falha ao realizar login.'
                    } else {
                        alert(dados.erro || 'Falha ao realizar login.')
                    }
                }
            } catch (erro) {
                console.error('Erro no login:', erro)
            }
        });
    }

    if (formularioCadastro) {
        formularioCadastro.addEventListener('submit', async (event) => {
            event.preventDefault()

            const usuario = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            };

            try {
                const resposta = await fetch(`${API_URL}/cadastro`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(usuario)
                });

                const dados = await resposta.json()

                if (resposta.ok) {
                    alert('Cadastro realizado com sucesso!')
                    formularioCadastro.reset();
                    window.location.href = 'login.html'
                } else {
                    alert(dados.erro || 'Erro ao realizar cadastro.')
                }
            } catch (erro) {
                console.error('Erro no cadastro:', erro)
            }
        })
    }
})
document.addEventListener('DOMContentLoaded', async () => {
    const painelCozinheiro = document.getElementById('painel_cozinheiro')

    if (painelCozinheiro) {
        async function carregarPedidos() {
            const resposta = await fetch(`${API_URL}/pedidos`)
            const pedido = await resposta.json()

            painelCozinheiro.innerHTML = ''
            pedidos.forEach((pedido) => {
                painelCozinheiro.innerHTML += `
                <div class = "card-pedido">
                    <h3> pedido #${pedido.id || ''} <h3>
                    <p><strong>Cliente:</strong> ${pedido.nome_usuario}</p>
                    <p><strong>item:</strong> ${pedido}x ${pedido.nome_comida}</p>
                    <p><strong>Cliente:</strong> ${pedido.status || 'Pendente'}</p>
                    
                    <button type = "button" onlick = "marcar Como Pronto (${pedido.id})>
                        Pronto para entregar
                    </button>
                </div>
                <hr> `


            })
        }

        carregarPedidos()
    }
})
async function marcarPronto(pediddo_id) {
    try {
        const resposta = await fetch(`${API_URL}/pedidos/${pediddo_id}/status`, {
            method: 'PUT',
            headers: { 'Contennt-Type': 'application/json' },
            body: JSON.stringify({ status: "Pronto para entregar" })

        })
        const dados = await resposta.json()

        if (resposta.ok) {
            alert(dados.mensagem)
            locatio.reload()
        }
        else{
            alert(dados.erro || 'erro ao atulizar pedido')
        }
    } catch(erro){
        console.error("erro na requesição")
    }
}
