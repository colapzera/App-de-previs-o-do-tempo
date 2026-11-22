const weatherDescriptions = {
    0: "Ceu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Neblina",
    48: "Neblina com geada",
    51: "Garoa leve",
    53: "Garoa moderada",
    55: "Garoa intensa",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva intensa",
    71: "Neve leve",
    73: "Neve moderada",
    75: "Neve intensa",
    80: "Pancadas leves",
    81: "Pancadas moderadas",
    82: "Pancadas fortes",
    95: "Trovoada",
    96: "Trovoada com granizo leve",
    99: "Trovoada com granizo intenso"
};

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code <= 2) return "🌤️";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 57) return "🌦️";
    if (code >= 61 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code >= 95) return "⛈️";
    return "🌡️";
}

function applyWeatherTheme(code) {
    document.body.classList.remove(
        "ceu-limpo",
        "nublado",
        "chuvoso",
        "neve",
        "trovoada"
    );

    if (code === 0) {
        document.body.classList.add("ceu-limpo");
    } else if (code >= 95) {
        document.body.classList.add("trovoada");
    } else if (code >= 71 && code <= 77) {
        document.body.classList.add("neve");
    } else if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82)
    ) {
        document.body.classList.add("chuvoso");
    } else {
        document.body.classList.add("nublado");
    }
}

async function mudarImagemDeFundo(nomeDaCidade, pais) {
    const termo = pais
        ? `${nomeDaCidade} ${pais} city`
        : `${nomeDaCidade} city`;
    const wikiUrl =
        "https://commons.wikimedia.org/w/api.php" +
        `?action=query&generator=search&gsrsearch=${encodeURIComponent(termo)}` +
        "&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=1600" +
        "&format=json&origin=*";

    try {
        const response = await fetch(wikiUrl);
        if (!response.ok) throw new Error("Imagem nao encontrada");

        const data = await response.json();
        const pages = data.query && data.query.pages;
        if (!pages) throw new Error("Imagem nao encontrada");

        const firstPage = Object.values(pages)[0];
        const imageUrl = firstPage.imageinfo?.[0]?.thumburl;

        if (!imageUrl) throw new Error("Imagem nao encontrada");

        document.body.style.backgroundImage =
            `url("${imageUrl}")`;
    } catch {
        const seed = encodeURIComponent(
            `${nomeDaCidade}-${pais || "cidade"}-${Date.now()}`
        );
        document.body.style.backgroundImage =
            `url("https://picsum.photos/seed/${seed}/1600/900")`;
    }
}

async function buscarClima() {
    const input = document.querySelector(".input-city");
    const cidade = input.value.trim();
    const card = document.querySelector(".container");

    if (!cidade) {
        input.focus();
        return;
    }

    const cityElement = document.querySelector(".city");
    const temperatureElement = document.querySelector(".tempo");
    const descriptionElement = document.querySelector(".description");
    const humidityElement = document.querySelector(".humidity");
    const iconElement = document.querySelector(".weather-icon");

    card.classList.remove("erro");
    card.classList.add("loading");
    cityElement.textContent = "Buscando...";
    descriptionElement.textContent = "Consultando dados em tempo real";
    temperatureElement.textContent = "···";
    humidityElement.textContent = "";
    iconElement.textContent = "🔄";

    try {
        const geocodingUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;
        const geocodingResponse = await fetch(geocodingUrl);

        if (!geocodingResponse.ok) {
            throw new Error("Nao foi possivel localizar a cidade.");
        }

        const geocodingData = await geocodingResponse.json();

        if (!geocodingData.results || geocodingData.results.length === 0) {
            throw new Error("Cidade nao encontrada.");
        }

        const location = geocodingData.results[0];
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Nao foi possivel consultar o clima.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;
        const weatherDescription =
            weatherDescriptions[current.weather_code] || "Condicao nao identificada";
        const locationName = location.admin1
            ? `${location.name}, ${location.admin1}`
            : location.name;

        cityElement.textContent = locationName;
        iconElement.textContent = getWeatherIcon(current.weather_code);
        temperatureElement.textContent =
            `${Math.round(current.temperature_2m)}\u00B0C`;
        descriptionElement.textContent =
            `${weatherDescription} - sensacao ${Math.round(current.apparent_temperature)}\u00B0C`;
        humidityElement.textContent =
            `Umidade: ${current.relative_humidity_2m}%`;
        applyWeatherTheme(current.weather_code);
        mudarImagemDeFundo(location.name, location.country);
    } catch (error) {
        card.classList.add("erro");
        cityElement.textContent = "Nao foi possivel obter o clima";
        temperatureElement.textContent = "--";
        descriptionElement.textContent = error.message;
        humidityElement.textContent = "";
        iconElement.textContent = "⚠️";
    } finally {
        card.classList.remove("loading");
    }
}

document.querySelector(".search-box")
    .addEventListener("submit", function (event) {
        event.preventDefault();
        buscarClima();
    });

document.querySelector(".input-city").value = "Rio de Janeiro";
buscarClima();