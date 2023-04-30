import { MqttReading } from "../types/types";

export function generateSms(reading: MqttReading, unit: string, problem: string): string {
  const { avian, reptilian } = reading;
  const { temperature, humidity } = unit === "avian" ? avian : reptilian;

  const temperatureMessage = `The temperature is ${temperature}°C. `;
  const humidityMessage = `The humidity is ${humidity}%. `;
  const warningMessage = `The ${problem} is in the ${reading.status.decision} range.`;
  const problemMessage = `There is a problem in the ${unit} enclosure. `;
  const message = `${problemMessage}${temperatureMessage}${humidityMessage}${warningMessage}`;
  return message;
}
