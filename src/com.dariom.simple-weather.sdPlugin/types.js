/**
 * @typedef {Object} Settings Action settings
 *
 * @property {string} apiKey OpenWeather API key
 * @property {string} type Type of configuration, either City or Coordinates
 * @property {string} city City
 * @property {string} latitude Latitude
 * @property {string} longitude Longitude
 * @property {string} refresh Refresh interval in milliseconds
 * @property {string} unit temperature unit (Celsius, Fahrenheit)
 */

/**
 * @typedef {Object} Payload A JSON object representing the payload sent by the Stream Deck
 *
 * @property {Settings} settings Action settings
 * @property {Object} coordinates The coordinates of the action triggered
 * @property {number} state Only set when the action has multiple states defined in its manifest.json. The 0-based value contains the current state of the action.
 * @property {number} userDesiredState Only set when the action is triggered with a specific value from a Multi-Action. For example, if the user sets the Game Capture Record action to be disabled in a Multi-Action, you would see the value 1. 0 and 1 are valid.
 * @property {boolean} isInMultiAction Boolean indicating if the action is inside a Multi-Action
 */

/**
 * @typedef {Object[]} GeoData Geocoding data
 *
 * @property {string} name City name
 * @property {number} lat Latitude
 * @property {number} lon Longitude
 * @property {string} country Country
 * @property {string} state State
 */

/**
 * @typedef {Object} WeatherData Weather data
 *
 * @property {WeatherMainData} main Main
 * @property {Weather[]} weather Weather
 */

/**
 * @typedef {Object} WeatherMainData Weather main data
 *
 * @property {number} temp Temperature
 * @property {number} feels_like Feels like temperature
 * @property {number} pressure Pressure, hPa
 * @property {number} humidity Humidity, %
 */

/**
 * @typedef {Object} Weather Weather
 *
 * @property {number} main Group of weather parameters
 * @property {number} description Weather condition within the group
 * @property {number} icon Weather icon id
 */
