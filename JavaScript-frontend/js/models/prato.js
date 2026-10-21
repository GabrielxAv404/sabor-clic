export class Prato {
    #id
    #nome
    #preco
    #descricao
    #status

    constructor({ id = null, nome, preco, descricao, status = 'DISPONIVEL' }) {
        this.#id = id
        this.#nome = nome
        this.#preco = parseFloat(preco) || 0
        this.#descricao = descricao
        this.#status = status
    }

    get id() { return this.#id }
    get nome() { return this.#nome }
    get preco() { return this.#preco.toFixed(2) }
    get precoNumero() { return this.#preco }
    get descricao() { return this.#descricao }
    get status() { return this.#status }

    set nome(novoNome) {
        if (novoNome && novoNome.trim() !== '') {
            this.#nome = novoNome
        }
    }

    toJSON() {
        return {
            id: this.#id,
            nome: this.#nome,
            preco: this.#preco,
            descricao: this.#descricao,
            status: this.#status
        }
    }
}