$PI.onConnected((json) => {
    const form = document.getElementById('settings');
    const settings = json.actionInfo.payload.settings;

    Utils.setFormValue(settings, form);

    form.addEventListener(
        'input',
        Utils.debounce(500, () => {
            const value = Utils.getFormValue(form);
            $PI.setSettings(value);
        })
    );
});
