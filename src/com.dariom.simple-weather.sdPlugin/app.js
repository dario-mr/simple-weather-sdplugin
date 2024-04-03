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

        const {apiKey, latitude, longitude, unit} = settings;

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${latitude}&lon=${longitude}&units=${unit}`;
        const weatherData = await getWeatherData(weatherUrl, context);

        const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
        const icon = await getWeatherIcon(iconUrl, context);

        const temperature = weatherData.main.temp.toFixed(0) + (unit === "metric" ? "°C" : "°F");

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
        logErrorAndThrow(context, "Settings are empty")
    }

    for (const key in settings) {
        if (!settings[key]) {
            logErrorAndThrow(context, `Setting <${key}> has no value`)
        }
    }
}

async function getWeatherData(url, context) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            logErrorAndThrow(context, `Error fetching weather data from <${url}>: <${response.status}, ${response.statusText}>`)
        });
}

async function getWeatherIcon(url, context) {
    return fetch(url)
        // download image as blob
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            logErrorAndThrow(context, `Error fetching weather icon from <${url}>: <${response.status}, ${response.statusText}>`)
        })
        // convert blob to base64 image
        .then(blob => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => {
                logErrorAndThrow(context, "Error converting weather icon to base64 image")
            };
            reader.readAsDataURL(blob);
        }));
}

function logErrorAndThrow(context, message) {
    $SD.showAlert(context);
    $SD.logMessage(message);

    throw new Error(message);
}
