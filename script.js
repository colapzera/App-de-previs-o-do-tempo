document.body.style.backgroundImage =
    `url("https://picsum.photos/1600/900?random=${Date.now()}")`;

function cliqueinobotao() {
    const input = document.querySelector(".input-city");
    const cidade = input.value.trim();

    if (!cidade) {
        input.focus();
        return;
    }

    document.querySelector(".city").textContent = `Tempo em ${cidade}`;
}

document.querySelector("#search-button")
    .addEventListener("click", cliqueinobotao);

document.querySelector(".input-city")
    .addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            cliqueinobotao();
        }
    });