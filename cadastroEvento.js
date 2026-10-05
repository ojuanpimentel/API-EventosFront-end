const formularioEvento = document.querySelector("#formEvento");
const seletorPalestrante = document.querySelector("#palestrante");
const mensagemEvento = document.querySelector("#mensagem");

async function carregarPalestrantes() {
    try {
        const palestrantes = await window.eventosApi.request("/palestrante");
        seletorPalestrante.replaceChildren(new Option("Selecione um palestrante", ""));

        palestrantes.forEach((palestrante) => {
            seletorPalestrante.add(new Option(palestrante.nome, palestrante.id));
        });

        if (palestrantes.length === 0) {
            mensagemEvento.textContent = "Cadastre um palestrante antes de cadastrar um evento.";
        }
    } catch (error) {
        seletorPalestrante.replaceChildren(new Option("Não foi possível carregar", ""));
        mensagemEvento.textContent = `Erro ao carregar palestrantes: ${error.message}`;
    }
}

formularioEvento.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagemEvento.textContent = "";

    const dados = new FormData(formularioEvento);
    const evento = {
        nome: dados.get("nome").trim(),
        descricao: dados.get("descricao").trim(),
        local: dados.get("local").trim(),
        data: new Date(dados.get("data")).toISOString(),
        palestranteId: Number(dados.get("palestranteId"))
    };

    try {
        await window.eventosApi.request("/evento", {
            method: "POST",
            body: JSON.stringify(evento)
        });
        formularioEvento.reset();
        mensagemEvento.textContent = "Evento cadastrado com sucesso.";
    } catch (error) {
        mensagemEvento.textContent = `Erro ao cadastrar evento: ${error.message}`;
    }
});

carregarPalestrantes();