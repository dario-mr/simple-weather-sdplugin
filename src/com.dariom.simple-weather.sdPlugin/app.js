const weatherAction = new Action('com.dariom.simple-weather.weather-action');
let intervalID = null;

weatherAction.onKeyUp(async ({context, payload}) => {
    await loadWeatherAndSetupRefresh(payload, context);
});

weatherAction.onWillAppear(async ({context, payload}) => {
    await loadWeatherAndSetupRefresh(payload, context);
});

async function loadWeatherAndSetupRefresh(payload, context) {
    const loadWeatherFn = loadWeather(payload, context);
    await loadWeatherFn();
    setupRefresh(parseInt(payload.settings.refresh), loadWeatherFn);
}

function loadWeather(payload, context) {
    return async () => {
        const settings = trimSettings(payload.settings);
        validateSettings(settings, context);

        const weatherUrl = await buildWeatherUrl(settings, context);
        const weatherData = await fetchData(weatherUrl, context);

        const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
        const icon = await getWeatherIcon(iconUrl, context);

        const temperature = weatherData.main.temp.toFixed(0) + (settings.unit === "metric" ? "°C" : "°F");

        $SD.setTitle(context, temperature);
        $SD.setImage(context, icon);
    }
}

function setupRefresh(refreshInterval, fn) {
    if (refreshInterval) {
        clearInterval(intervalID);
        intervalID = setInterval(() => fn(), refreshInterval);
    }
}

function trimSettings(settings) {
    return Object.fromEntries(
        Object.keys(settings)
            .map(key => [key, settings[key].trim()])
    );
}

function validateSettings(settings, context) {
    if (Object.keys(settings).length === 0) {
        logErrorAndThrow(context, "Settings are empty");
    }

    const {apiKey, type, city, latitude, longitude} = settings;

    if (!apiKey) {
        logErrorAndThrow(context, "<API key> has no value");
    }
    if (type === "city") {
        if (!city) {
            logErrorAndThrow(context, "<City> has no value");
        }
    }
    if (type === "coordinates") {
        if (!latitude || !longitude) {
            logErrorAndThrow(context, "<Latitude> or <Longitude> have no value");
        }
    }
}

async function buildWeatherUrl(settings, context) {
    const {apiKey, type, city, latitude, longitude, unit} = settings;

    if (type === "coordinates") {
        return `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${latitude}&lon=${longitude}&units=${unit}`;
    }
    if (type === "city") {
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        const geoData = await fetchData(geocodingUrl, context);
        return `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${geoData[0].lat}&lon=${geoData[0].lon}&units=${unit}`;
    }
}

async function fetchData(url, context) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            logErrorAndThrow(context, `Error fetching data from <${url}>: <${response.status}, ${response.statusText}>`);
        });
}

async function getWeatherIcon(url, context) {
    return fetch(url)
        // download image as blob
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            logErrorAndThrow(context, `Error fetching weather icon from <${url}>: <${response.status}, ${response.statusText}>`);
        })
        // convert blob to base64 image
        .then(blob => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => {
                logErrorAndThrow(context, "Error converting weather icon to base64 image");
            };
            reader.readAsDataURL(blob);
        }));
}

function logErrorAndThrow(context, message) {
    $SD.showAlert(context);
    $SD.logMessage(message);

    throw new Error(message);
}
