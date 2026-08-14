import { geocodeCity, getDailyForecast, getForecast } from "./src/api.ts";
import { green, red, yellow } from "./src/colors.ts";
import { loadConfig, saveConfig } from "./src/config.ts";
import type { City, TemperatureUnit, WeatherConfig } from "./src/types.ts";
import { cityLabel, closeInput, prompt, renderCities, renderDailyForecast, renderMenu, SEPARATOR } from "./src/ui.ts";

async function showWeatherForCity(city: City, unit: TemperatureUnit): Promise<void> {
  try {
    const temperature = await getForecast(city, unit);
    const unitLabel = unit === "celsius" ? "°C" : "°F";
    console.log(`\n${SEPARATOR}\n  ${cityLabel(city)}\n  ${yellow(`${temperature} ${unitLabel}`)}\n${SEPARATOR}`);
  } catch (error) {
    console.log(`\n  ${red(`Error: ${error instanceof Error ? error.message : String(error)}`)}`);
  }
}

async function showDefaultCityWeather(config: WeatherConfig): Promise<void> {
  const city = config.cities.find((item) => item.name === config.defaultCity);
  if (!city) {
    console.log("\n  No hay ciudad default configurada. Usa la opción 5 para establecerla.");
    return;
  }
  await showWeatherForCity(city, config.unit);
}

async function showAllCitiesWeather(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }
  for (const city of config.cities) {
    await showWeatherForCity(city, config.unit);
  }
}

async function showSevenDayForecast(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Usa la opción 3 para agregar una.");
    return;
  }

  renderCities(config.cities);
  const choice = await prompt("  Elige un número (0 para cancelar): ");
  const index = Number.parseInt(choice, 10) - 1;
  const city = config.cities[index];
  if (!city) {
    console.log("\n  Selección inválida, cancelado.");
    return;
  }

  try {
    const forecast = await getDailyForecast(city, config.unit);
    console.log(`\n  ${cityLabel(city)}`);
    renderDailyForecast(forecast, config.unit);
  } catch (error) {
    console.log(`\n  ${red(`Error: ${error instanceof Error ? error.message : String(error)}`)}`);
  }
}

async function addCity(config: WeatherConfig): Promise<void> {
  const name = await prompt("  Nombre de la ciudad: ");
  if (!name) {
    console.log("\n  Nombre vacío, cancelado.");
    return;
  }

  const results = await geocodeCity(name);
  if (results.length === 0) {
    console.log(`\n  No se encontró ninguna ciudad para "${name}".`);
    return;
  }

  renderCities(results);
  const choice = await prompt("  Elige un número (0 para cancelar): ");
  const index = Number.parseInt(choice, 10) - 1;
  const selected = results[index];
  if (!selected) {
    console.log("\n  Selección inválida, cancelado.");
    return;
  }

  const exists = config.cities.some(
    (city) =>
      city.name === selected.name &&
      city.latitude === selected.latitude &&
      city.longitude === selected.longitude,
  );
  if (exists) {
    console.log(`\n  "${cityLabel(selected)}" ya está en la lista.`);
    return;
  }

  config.cities.push(selected);
  await saveConfig(config);
  console.log(`\n  ${green(`Ciudad "${cityLabel(selected)}" agregada.`)}`);
}

async function removeCity(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas.");
    return;
  }

  renderCities(config.cities);
  const choice = await prompt("  Elige un número (0 para cancelar): ");
  const index = Number.parseInt(choice, 10) - 1;
  const city = config.cities[index];
  if (!city) {
    console.log("\n  Selección inválida, cancelado.");
    return;
  }

  config.cities.splice(index, 1);
  if (config.defaultCity === city.name) {
    config.defaultCity = null;
  }
  await saveConfig(config);
  console.log(`\n  ${green(`Ciudad "${city.name}" eliminada.`)}`);
}

async function setDefaultCity(config: WeatherConfig): Promise<void> {
  if (config.cities.length === 0) {
    console.log("\n  No hay ciudades guardadas. Agrega una primero (opción 3).");
    return;
  }

  renderCities(config.cities);
  console.log(`  ${config.cities.length + 1}. Buscar una nueva ciudad`);
  const choice = await prompt("  Elige un número (0 para cancelar): ");
  const index = Number.parseInt(choice, 10) - 1;

  if (index === config.cities.length) {
    await addCity(config);
    const added = config.cities[config.cities.length - 1];
    if (added) {
      config.defaultCity = added.name;
      await saveConfig(config);
    }
    return;
  }

  const city = config.cities[index];
  if (!city) {
    console.log("\n  Selección inválida, cancelado.");
    return;
  }

  config.defaultCity = city.name;
  await saveConfig(config);
  console.log(`\n  ${green(`Ciudad default establecida: "${cityLabel(city)}".`)}`);
}

async function adjustSettings(config: WeatherConfig): Promise<void> {
  const currentUnit = config.unit === "celsius" ? "°C" : "°F";
  console.log(`\n  Unidad de temperatura actual: ${currentUnit}`);
  console.log("  1. Celsius (°C)");
  console.log("  2. Fahrenheit (°F)");
  const choice = await prompt("  Elige una opción (0 para cancelar): ");

  if (choice === "1") {
    config.unit = "celsius";
  } else if (choice === "2") {
    config.unit = "fahrenheit";
  } else {
    console.log("\n  Cambios descartados.");
    return;
  }

  await saveConfig(config);
  const newUnit = config.unit === "celsius" ? "°C" : "°F";
  console.log(`\n  ${green(`Unidad actualizada: ${newUnit}`)}`);
}

async function main(): Promise<void> {
  const config = await loadConfig();
  let running = true;

  while (running) {
    renderMenu(config.cities.length, config.unit);
    const answer = await prompt("  Selecciona una opción: ");

    switch (answer) {
      case "1":
        await showDefaultCityWeather(config);
        break;
      case "2":
        await showAllCitiesWeather(config);
        break;
      case "3":
        await addCity(config);
        break;
      case "4":
        await removeCity(config);
        break;
      case "5":
        await setDefaultCity(config);
        break;
      case "6":
        await showSevenDayForecast(config);
        break;
      case "8":
        await adjustSettings(config);
        break;
      case "9":
        running = false;
        break;
      default:
        console.log("\n  Opción inválida. Intenta de nuevo.");
    }
  }

  closeInput();
}

main();
