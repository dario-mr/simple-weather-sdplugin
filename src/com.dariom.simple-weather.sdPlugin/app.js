const weatherAction = new Action('com.dariom.simple-weather.weather-action');
let intervalID = null;

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({actionInfo, appInfo, connection, messageType, port, uuid}) => {
});

weatherAction.onKeyUp(async ({action, context, device, event, payload}) => {
    const settings = trimSettings(payload.settings);
    validateSettings(settings, context);

    const loadWeatherFn = loadWeather(settings, context);
    await loadWeatherFn();
    setupRefresh(settings.refresh, loadWeatherFn);
});

function loadWeather(settings, context) {
    return async () => {
        const {apiKey, latitude, longitude, unit} = settings;

        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${latitude}&lon=${longitude}&units=${unit}`;
        const weatherData = await getWeatherData(weatherUrl, context);

        const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
        let icon = await getWeatherIcon(iconUrl, context);

        const temperature = weatherData.main.temp.toFixed(0) + (unit === "metric" ? "°C" : "°F");

        $SD.setTitle(context, temperature);
        $SD.setImage(context, icon);
    }
}

function setupRefresh(refresh, fn) {
    const refreshInterval = parseInt(refresh);
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
    for (let key in settings) {
        if (!settings[key]) {
            $SD.showAlert(context);
            throw new Error(`Setting <${key}> has no value`);
        }
    }
}

async function getWeatherData(url, context) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            $SD.showAlert(context);
            throw new Error(`Error fetching weather data from <${url}>: <${response.status}, ${response.statusText}>`);
        });
}

async function getWeatherIcon(url, context) {
    return fetch(url)
        // download image as blob
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            $SD.showAlert(context);
            throw new Error(`Error fetching weather icon from <${url}>: <${response.status}, ${response.statusText}>`);
        })
        // convert blob to base64 image
        .then(blob => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => {
                $SD.showAlert(context);
                throw new Error("Error loading weather icon");
            };
            reader.readAsDataURL(blob);
        }));
}
