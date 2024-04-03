# Simple Weather plugin for Stream Deck

This plugins displays weather conditions as a button in your Stream Deck, using the `OpenWeather` API.

Compatible with `windows` and `macOS`.

## Installation

- install the plugin file from the `relase` folder
- in your Stream Deck app, drag the `Simple Weather` button into an available slot
- fill in the button settings
- click the button to activate it

## Button Settings

- `API key`: your `OpenWeather` API key (get it [here](https://home.openweathermap.org/api_keys))
- `Latitude`: latitude for which the weather conditions will be displayed (range: -90, 90)
- `Longitude`: longitude for which the weather conditions will be displayed (range: -180, 180)
- `Unit`: temperature unit (Celsius, Fahrenheit)
- `Refresh`: how often the data is refreshed

## Packaging

### MacOS

In order to package and distribute your own version of this plugin, run the following command from the project root:

```shell
./DistributionTool -b -i src/com.dariom.simple-weather.sdPlugin -o release
```

The generated plugin can be found in the `release` folder.

### Windows

Follow the instructions on Stream Deck SDK [page](https://docs.elgato.com/sdk/plugins/packaging)