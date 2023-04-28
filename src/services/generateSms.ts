import { MqttReading } from "../types/types";

export function generateSms(reading: MqttReading, unit: string, problem: string): string {
  const { avian, reptilian } = reading;
  const { temperature, humidity } = unit === "avian" ? avian : reptilian;
  const temperatureMessage = `Temperature is ${temperature}°C`;
  const humidityMessage = `Humidity is ${humidity}%`;
  const enclosureMessage = `in the ${unit} enclosure`;
  const problemMessage = `The ${problem} is in the ${reading.status.decision} range.`;
  const message = `${temperatureMessage}, ${humidityMessage}, ${enclosureMessage}. ${problemMessage}`;
  return message;
}
