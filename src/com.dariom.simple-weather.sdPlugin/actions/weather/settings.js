$PI.onConnected((json) => {
    const form = document.getElementById('settings');
    /** @type {Settings} */
    const settings = json.actionInfo.payload.settings;

    Utils.setFormValue(settings, form);
    showElementsBasedOnType(settings.type);

    form.addEventListener(
        'input',
        Utils.debounce(500, () => {
            const settings = trimSettings(Utils.getFormValue(form));
            $PI.setSettings(settings);
        })
    );
});

document.getElementById('get-api-key-button').addEventListener('click', () => {
    $PI.openUrl("https://home.openweathermap.org/api_keys");
});

document.getElementById('type').addEventListener('change', (event) => {
    showElementsBasedOnType(event.target.value);
});

/**
 * @param {string} type Location type (city or coordinates)
 */
function showElementsBasedOnType(type = 'city') {
    const cityContainer = document.getElementById('city-container');
    const coordinatesContainer = document.getElementById('coordinates-container');

    switch (type) {
        case 'city':
            cityContainer.classList.remove("hidden");
            coordinatesContainer.classList.add("hidden");
            break;
        case 'coordinates':
            cityContainer.classList.add("hidden");
            coordinatesContainer.classList.remove("hidden");
            break;
    }
}

/**
 * @param {Settings} settings
 * @returns {Settings} trimmed settings
 */
function trimSettings(settings) {
    return Object.fromEntries(
        Object.keys(settings)
            .map(key => [key, settings[key].trim()])
    );
}