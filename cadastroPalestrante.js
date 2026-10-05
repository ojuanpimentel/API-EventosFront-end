const formularioPalestrante = document.querySelector("#formPalestrante");
const mensagemPalestrante = document.querySelector("#mensagem");

formularioPalestrante.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagemPalestrante.textContent = "";

    const dados = new FormData(formularioPalestrante);
    const palestrante = {
        nome: dados.get("nome").trim(),
        email: dados.get("email").trim()
    };

    try {
        await window.eventosApi.request("/palestrante", {
            method: "POST",
            body: JSON.stringify(palestrante)
        });
        formularioPalestrante.reset();
        mensagemPalestrante.textContent = "Palestrante cadastrado com sucesso.";
    } catch (error) {
        mensagemPalestrante.textContent = `Erro ao cadastrar palestrante: ${error.message}`;
    }
});