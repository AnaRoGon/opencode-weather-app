import type { WeatherConfig } from "../types/Config.ts";
import { prompt } from "../presentation/input.ts";
import { showInfo, showPlain, showSuccess } from "../presentation/output.ts";
import { saveSettings } from "../storage/settingsStorage.ts";
import { unitLabel } from "../utils/format.ts";

export async function adjustSettings(config: WeatherConfig): Promise<void> {
  showInfo(`Unidad de temperatura actual: ${unitLabel(config.unit)}`);
  showPlain("  1. Celsius (°C)");
  showPlain("  2. Fahrenheit (°F)");
  const choice = await prompt("  Elige una opción (0 para cancelar): ");

  if (choice === "1") {
    config.unit = "celsius";
  } else if (choice === "2") {
    config.unit = "fahrenheit";
  } else {
    showInfo("Cambios descartados.");
    return;
  }

  await saveSettings(config);
  showSuccess(`Unidad actualizada: ${unitLabel(config.unit)}`);
}