const weatherAction = new Action('com.dariom.simple-weather.weather-action');

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({actionInfo, appInfo, connection, messageType, port, uuid}) => {
});

weatherAction.onKeyUp(async ({action, context, device, event, payload}) => {
    const {apiKey, latitude, longitude, unit} = payload.settings;

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&lat=${latitude}&lon=${longitude}&units=${unit}`;

    let weatherData;
    try {
        weatherData = await getWeatherData(weatherUrl);
    } catch (e) {
        $SD.showAlert(context);
        return;
    }

    const temperature = weatherData.main.temp.toFixed(0) + (unit === "metric" ? "°C" : "°F");
    const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

    let icon;
    try {
        icon = await getWeatherIcon(iconUrl);
    } catch (e) {
        $SD.showAlert(context);
        return;
    }

    $SD.setTitle(context, temperature, Constants.hardwareAndSoftware);
    $SD.setImage(context, icon);
});

async function getWeatherData(url) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject({
                status: response.status,
                statusText: response.statusText
            });
        });
}

async function getWeatherIcon(url) {
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.blob();
            }
            return Promise.reject({
                status: response.status,
                statusText: response.statusText
            });
        })
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));
}
