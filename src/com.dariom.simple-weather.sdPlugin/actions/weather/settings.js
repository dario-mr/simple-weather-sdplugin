$PI.onConnected((json) => {
    const form = document.getElementById('settings');
    const settings = json.actionInfo.payload.settings;

    Utils.setFormValue(settings, form);
    showElementsBasedOnType(settings.type);

    form.addEventListener(
        'input',
        Utils.debounce(500, () => {
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    );
});

document.getElementById('getApiKey').addEventListener('click', () => {
    $PI.openUrl("https://home.openweathermap.org/api_keys");
});

document.getElementById('type').addEventListener('change', (event) => {
    showElementsBasedOnType(event.target.value);
});

function showElementsBasedOnType(type) {
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