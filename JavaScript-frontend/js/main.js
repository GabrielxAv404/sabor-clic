const API_URL = 'http://127.0.0.1:5000/api'

document.addEventListener('DOMContentLoaded', async () => {
    const areacardapio = document.getElementById('Cardapio')
    const formulariopedido = document.getElementById('formulario_pedido')

    if (areacardapio && formulariopedido) {

        const resposta = await fetch(`${API_URL}/cardapio`);
        const pratos = await resposta.json()

        /* limpar textos antigos */
        areacardapio.innerHTML = ''

        pratos.forEach((prato) => {

            areacardapio.innerHTML += `
            <div class = "itemPratos"> 
            <h3> ${prato.nome} - R$ ${prato.preco} </h3>
            <p> ${prato.descricao} </p>
            <button type = "button" onclick="document.getElementById('nome_comida').value = '${prato.nome}'">
                Selecionar
            </button>
            </div>
            <hr>`

        });
        formulariopedido.addEventListener("submit", async (event) => {
            event.preventDefault()

            const pedido = {
                nome_usuario: document.getElementById('nome_usuario').value,
                num_mesa: document.getElementById('num_mesa').value,
                nome_comida: document.getElementById('nome_comida').value,
                quantidade: document.getElementById('quantidade').value
            }


            const resposta = await fetch(`${API_URL}/pedidos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pedido)
            })

            if (resposta.ok) {
                alert('pedido realizado com sucesso')
                formulariopedido.reset()
            }

        })

    }
})

document.addEventListener('DOMContentLoaded', async () => {
    const formulario_admin = document.getElementById('formulario_administrador')
    const listaPratos = document.getElementById('lista_pratos')

    if (formulario_admin && listaPratos) {


        const buscar = await fetch(`${API_URL}/cardapio`)
        const pratosbuscas = await buscar.json()

        listaPratos.innerHTML = ''

        pratosbuscas.forEach((buscasItempratos) => {


            listaPratos.innerHTML += `
            <tr>
                <td> ${buscasItempratos.nome}</td>
                <td> R$ ${buscasItempratos.preco}</td>
                <td> ${buscasItempratos.descricao}</td>
            </tr>
            `
        })
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
            }
        })
    }

    const painelCozinheiro = document.getElementById('painel_cozinheiro')
    if (painelCozinheiro) {

        async function carregarPedidos() {
        const resposta = await fetch(`${API_URL}/pedidos`)
        const pedidos = await resposta.json()

        painelCozinheiro.innerHTML = ''
        pedidos.forEach((pedido) => {
            painelCozinheiro.innerHTML += `
            <div class="card-pedido">
            <h3>Mesa: ${pedido.num_mesa}</h3>
            <p>Cliente: ${pedido.nome_usuario}</p>
            <p>Item Prato: ${pedido.quantidade}x ${pedido.nome_comida}</p>
            </div>
            <hr>`

        })
    }
    carregarPedidos()
}
})
