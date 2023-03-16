import {
  Reading,
  ReadingStatus,
  Status,
  Unit,
  Problem,
  BadReadingStatus,
  Range,
} from "../types/types";

/*
 * Check if the reading is within the expected range
 *The readings can be ideal, warning or critical
 *If the reading is not ideal, generate an SMS message
 */

function checkReading(reading: Reading): ReadingStatus {
  const { sensorOne, sensorTwo } = reading.reading;
  const { temperature: avianTemp, humidity: avianHumidity } = sensorOne;
  const { temperature: reptileTemp, humidity: reptileHumidity } = sensorTwo;

  let avianTempStatus = getRange(
    { idealMin: 23, idealMax: 30, warningMin: 21, warningMax: 35 },
    avianTemp
  );
  let avianHumidityStatus = getRange(
    { idealMin: 30, idealMax: 55, warningMin: 25, warningMax: 60 },
    avianHumidity
  );
  let reptileTempStatus = getRange(
    { idealMin: 22, idealMax: 28, warningMin: 20, warningMax: 32 },
    reptileTemp
  );
  let reptileHumidityStatus = getRange(
    { idealMin: 30, idealMax: 70, warningMin: 25, warningMax: 75 },
    reptileHumidity
  );
  if (avianTempStatus !== "ideal") {
    const message = generateSms(avianTempStatus, "AVIAN", "temperature", avianTemp);
    return { state: avianTempStatus, message };
  } else if (avianHumidityStatus !== "ideal") {
    const message = generateSms(avianHumidityStatus, "AVIAN", "humidity", avianHumidity);
    return { state: avianHumidityStatus, message };
  } else if (reptileTempStatus !== "ideal") {
    const message = generateSms(reptileTempStatus, "REPTILE", "temperature", reptileTemp);
    return { state: reptileTempStatus, message };
  } else if (reptileHumidityStatus !== "ideal") {
    const message = generateSms(reptileHumidityStatus, "REPTILE", "humidity", reptileHumidity);
    return { state: reptileHumidityStatus, message };
  }
  return { state: "ideal", message: null };
}

function getRange(range: Range, value: number): Status {
  const { idealMin, idealMax, warningMin, warningMax } = range;
  if (value >= idealMin && value <= idealMax) {
    return "ideal";
  } else if (value > idealMax && value <= warningMax) {
    return "warning";
  } else if (value < idealMin && value >= warningMin) {
    return "warning";
  } else {
    return "critical";
  }
}

function generateSms(status: BadReadingStatus, unit: Unit, prob: Problem, read: number): string {
  switch (status) {
    case "warning":
      return `The ${prob} in the ${unit.toLowerCase()} unit is in the warning range. The ${prob} is ${read}`;
    case "critical":
      return `The ${prob} in the ${unit.toLowerCase()} unit is in the critical range. The ${prob} is ${read}`;
  }
}

export default checkReading;
