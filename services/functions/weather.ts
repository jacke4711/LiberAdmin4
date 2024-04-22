

// weather.ts: Contain the weather function we'll run for our assistant.

import { fetchWeatherApi } from 'openmeteo';



const params = {
    "latitude": 61.3482,
    "longitude": 16.3946,
    "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min", "apparent_temperature_max", "apparent_temperature_min"],
    "timezone": "Europe/Berlin",
    "start_date": "2024-04-22",
    "end_date": "2024-04-28"
};

type WeatherCodes = {
    [key: string]: WeatherCode;
};

type WeatherCode = {
    day: {
        description: string;
        image: string;
    };
    night: {
        description: string;
        image: string;
    };
};

import weatherCodesJson from './weatherCodes.json' assert { type: 'json' };

const weatherCodes: WeatherCodes = weatherCodesJson;

const getWeatherDescription = (code: string, isDaytime: boolean): string => {
    const entry = weatherCodes[code]; // Now this won't throw an error
    if (!entry) {
        console.error(`Unknown Weather Code: ${code}`);
        return `Unknown Weather Code: ${code}`;
    }
    return isDaytime ? entry.day.description : entry.night.description;
};


const url = "https://api.open-meteo.com/v1/forecast";
// Helper function to form time ranges
const range = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);


export async function getWeather(): Promise<string[]> {
    const responses = await fetchWeatherApi(url, params);
    let result: string [] = [];


    // Process first location. Add a for-loop for multiple locations or weather models
    const response = responses[0];

    // Attributes for timezone and location
    const utcOffsetSeconds = response.utcOffsetSeconds();
    const timezone = response.timezone();
    const timezoneAbbreviation = response.timezoneAbbreviation();
    const latitude = response.latitude();
    const longitude = response.longitude();

    const daily = response.daily()!;


    // Note: The order of weather variables in the URL query and the indices below need to match!
    const weatherData = {

        daily: {
            time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
                (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            weatherCode: daily.variables(0)!.valuesArray()!,
            temperature2mMax: daily.variables(1)!.valuesArray()!,
            temperature2mMin: daily.variables(2)!.valuesArray()!,
            apparentTemperatureMax: daily.variables(3)!.valuesArray()!,
            apparentTemperatureMin: daily.variables(4)!.valuesArray()!,
        },

    };

    // `weatherData` now contains a simple structure with arrays for datetime and weather data
    for (let i = 0; i < weatherData.daily.time.length; i++) {
        /*console.log(
            weatherData.daily.time[i].toISOString(),
            weatherData.daily.weatherCode[i],
            weatherData.daily.temperature2mMax[i],
            weatherData.daily.temperature2mMin[i],
            weatherData.daily.apparentTemperatureMax[i],
            weatherData.daily.apparentTemperatureMin[i]
        );*/

        result.push(`On ${weatherData.daily.time[i].toLocaleDateString()} it will be ${getWeatherDescription(weatherData.daily.weatherCode[i].toString(), true)} with a min temperature at ${weatherData.daily.temperature2mMin[i]} and max ${weatherData.daily.temperature2mMax[i]} which appears like min ${weatherData.daily.apparentTemperatureMin[i]} and max ${weatherData.daily.apparentTemperatureMax[i]} degrees celsius`)
    }

    return result;
}


/*async function getCountryInformation(params) {
    const country = params.country;

    try {
        const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(
            country
        )}`;
        const response = await axios.get(url);
        // console.log(response.data); if you want to inspect the output
        return JSON.stringify(response.data);
    } catch (error) {
        console.error(error);
        return null;
    }
}*/

