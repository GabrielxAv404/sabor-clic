export class Pedido {
    #id
    #nomeUsuario
    #nomeComida
    #quantidade
    #status
    #temposEstimados

    constructor({ id, nome_usuario, nome_comida, quantidade, status = 'AGUARDANDO', tempo_estimado = 0 }) {
        this.#id = id
        this.#nomeUsuario = nome_usuario
        this.#nomeComida = nome_comida
        this.#quantidade = parseInt(quantidade, 10)
        this.#status = status
        this.#temposEstimados = tempo_estimado
    }

    get id() { return this.#id }
    get nomeUsuario() { return this.#nomeUsuario }
    get nomeComida() { return this.#nomeComida }
    get quantidade() { return this.#quantidade }
    get status() { return this.#status }
    get tempoEstimado() { return this.#temposEstimados }

    toJSON() {
        return {
            id: this.#id,
            nome_usuario: this.#nomeUsuario,
            nome_comida: this.#nomeComida,
            quantidade: this.#quantidade,
            status: this.#status,
            tempo_estimado: this.#temposEstimados
        }
    }
}