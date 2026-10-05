const listaEventos = document.querySelector("#listaEventos");
const mensagemGerenciador = document.querySelector("#mensagem");
const dialogEdicao = document.querySelector("#dialogEdicao");
const formularioEdicao = document.querySelector("#formEdicao");
const seletorEdicaoPalestrante = document.querySelector("#edicaoPalestrante");
let eventoEmEdicao;

function adicionarCampo(card, titulo, valor) {
    const linha = document.createElement("div");
    const rotulo = document.createElement("span");
    const conteudo = document.createElement("span");

    rotulo.className = "titulo";
    rotulo.textContent = `${titulo}: `;
    conteudo.textContent = valor;
    linha.append(rotulo, conteudo);
    card.append(linha);
}

function renderizarEventos(eventos) {
    listaEventos.replaceChildren();

    if (eventos.length === 0) {
        mensagemGerenciador.textContent = "Ainda não há eventos cadastrados.";
        return;
    }

    mensagemGerenciador.textContent = "";
    eventos.forEach((evento) => {
        const card = document.createElement("article");
        const acoes = document.createElement("div");
        const editar = document.createElement("button");
        const excluir = document.createElement("button");
        const nomesPalestrantes = evento.palestrantes.map(({ nome }) => nome).join(", ");

        card.className = "card";
        adicionarCampo(card, "NOME", evento.nome);
        adicionarCampo(card, "DESCRIÇÃO", evento.descricao);
        adicionarCampo(card, "LOCAL", evento.local);
        adicionarCampo(card, "DATA", new Date(evento.data).toLocaleString("pt-BR"));
        adicionarCampo(card, "PALESTRANTE", nomesPalestrantes || "Não informado");

        acoes.className = "botoes";
        editar.type = "button";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => abrirEdicao(evento));
        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirEvento(evento));
        acoes.append(editar, excluir);
        card.append(acoes);
        listaEventos.append(card);
    });
}

async function carregarEventos() {
    mensagemGerenciador.textContent = "Carregando eventos...";
    try {
        const eventos = await window.eventosApi.request("/evento");
        renderizarEventos(eventos);
    } catch (error) {
        mensagemGerenciador.textContent = `Erro ao carregar eventos: ${error.message}`;
    }
}

async function abrirEdicao(evento) {
    try {
        const palestrantes = await window.eventosApi.request("/palestrante");
        seletorEdicaoPalestrante.replaceChildren();
        palestrantes.forEach((palestrante) => {
            seletorEdicaoPalestrante.add(new Option(palestrante.nome, palestrante.id));
        });

        eventoEmEdicao = evento;
        document.querySelector("#edicaoNome").value = evento.nome;
        document.querySelector("#edicaoDescricao").value = evento.descricao;
        document.querySelector("#edicaoLocal").value = evento.local;
        document.querySelector("#edicaoData").value = dataParaInput(evento.data);
        if (evento.palestrantes.length > 0) {
            seletorEdicaoPalestrante.value = evento.palestrantes[0].id;
        }
        dialogEdicao.showModal();
    } catch (error) {
        mensagemGerenciador.textContent = `Erro ao carregar palestrantes: ${error.message}`;
    }
}

function dataParaInput(data) {
    const dataLocal = new Date(data);
    dataLocal.setMinutes(dataLocal.getMinutes() - dataLocal.getTimezoneOffset());
    return dataLocal.toISOString().slice(0, 16);
}

formularioEdicao.addEventListener("submit", async (event) => {
    event.preventDefault();
    const evento = {
        nome: document.querySelector("#edicaoNome").value.trim(),
        descricao: document.querySelector("#edicaoDescricao").value.trim(),
        local: document.querySelector("#edicaoLocal").value.trim(),
        data: new Date(document.querySelector("#edicaoData").value).toISOString(),
        palestranteId: Number(seletorEdicaoPalestrante.value)
    };

    try {
        await window.eventosApi.request(`/evento/${eventoEmEdicao.id}`, {
            method: "PUT",
            body: JSON.stringify(evento)
        });
        dialogEdicao.close();
        await carregarEventos();
        mensagemGerenciador.textContent = "Evento atualizado com sucesso.";
    } catch (error) {
        mensagemGerenciador.textContent = `Erro ao atualizar evento: ${error.message}`;
    }
});

document.querySelector("#cancelarEdicao").addEventListener("click", () => {
    dialogEdicao.close();
});

async function excluirEvento(evento) {
    if (!window.confirm(`Deseja excluir o evento "${evento.nome}"?`)) {
        return;
    }

    try {
        await window.eventosApi.request(`/evento/${evento.id}`, { method: "DELETE" });
        await carregarEventos();
        mensagemGerenciador.textContent = "Evento excluído com sucesso.";
    } catch (error) {
        mensagemGerenciador.textContent = `Erro ao excluir evento: ${error.message}`;
    }
}

carregarEventos();