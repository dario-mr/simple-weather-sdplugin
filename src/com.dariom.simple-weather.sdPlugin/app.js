/** @type {ELGSDAction} */
const weatherAction = new Action('com.dariom.simple-weather.weather-action');

/** @type {number} */
let intervalID;

weatherAction.onKeyUp(async ({context, payload}) => {
    await loadWeatherAndSetupRefresh(payload, context);
});

weatherAction.onWillAppear(async ({context, payload}) => {
    await loadWeatherAndSetupRefresh(payload, context);
});

/**
 * @param payload {Payload} payload
 * @param context {string} A value to identify the instance of the action
 */
async function loadWeatherAndSetupRefresh(payload, context) {
    const loadWeatherFn = loadWeather(payload.settings, context);
    await loadWeatherFn();
    setupRefresh(parseInt(payload.settings.refresh), loadWeatherFn);
}

/**
 * @param settings {Settings} Action settings
 * @param context {string} A value to identify the instance of the action
 * @returns {(function(): Promise<void>)|*} function to load the weather and display it in the button
 */
function loadWeather(settings, context) {
    return async () => {
        validateSettings(settings, context);

        const weatherUrl = await buildWeatherUrl(settings, context);
        /** @type {WeatherData} */
        const weatherData = await fetchData(weatherUrl, context);

        const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
        const icon = await getWeatherIcon(iconUrl, context);

        const temperature = weatherData.main.temp.toFixed(0) + (settings.unit === "metric" ? "°C" : "°F");
        const title = buildTitle(settings, temperature);

        $SD.setTitle(context, title);
        $SD.setImage(context, icon);
    }
}

/**
 * @param refreshInterval {number} Refresh interval in milliseconds
 * @param fn {function} Function to run on the given interval
 */
function setupRefresh(refreshInterval, fn) {
    if (refreshInterval) {
        clearInterval(intervalID);
        intervalID = setInterval(() => fn(), refreshInterval);
    }
}

/**
 * @param settings {Settings} Action settings
 * @param context {string} A value to identify the instance of the action
 */
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

/**
 * @param settings {Settings} Action settings
 * @param context {string} A value to identify the instance of the action
 * @returns {Promise<string>} weather url
 */
async function buildWeatherUrl(settings, context) {
    const {apiKey, type, city, latitude, longitude, unit} = settings;

    if (type === "coordinates") {
        return `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${latitude}&lon=${longitude}&units=${unit}`;
    }
    if (type === "city") {
        const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        /** @type {GeoData} */
        const geoData = await fetchData(geocodingUrl, context);
        return `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${geoData[0].lat}&lon=${geoData[0].lon}&units=${unit}`;
    }
}

/**
 * @param url {string} url to fetch
 * @param context {string} A value to identify the instance of the action
 * @returns {Promise<Object>} fetched data
 */
async function fetchData(url, context) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            logErrorAndThrow(context, `Error fetching data from <${url}>: <${response.status}, ${response.statusText}>`);
        });
}

/**
 * @param url {string} url of the weather icon to fetch
 * @param context {string} A value to identify the instance of the action
 * @returns {Promise<string>} base64 representation of the weather icon
 */
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

/**
 * @param settings {Settings} Action settings
 * @param temperature {string} Formatted temperature
 * @return {string} The button title, comprised of City (if setting applied) and Temperature
 */
function buildTitle(settings, temperature) {
    let title = "";

    if (settings.type === "city") {
        title += `${settings.city}\n\n\n\n`;

    }
    title += temperature;

    return title;
}

/**
 * @param context {string} A value to identify the instance of the action
 * @param message {string} Message to log
 * @throws {Error} Throws error in order to stop execution
 */
function logErrorAndThrow(context, message) {
    $SD.showAlert(context);
    $SD.logMessage(message);

    throw new Error(message);
}
