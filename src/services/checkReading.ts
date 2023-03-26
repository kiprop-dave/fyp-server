import {
  Reading,
  ReadingStatus,
  Status,
  Unit,
  Problem,
  BadReadingStatus,
  Range,
  EnclosureStatus,
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

  let avianTempStatus: EnclosureStatus = {
    enclosure: "AVIAN",
    condition: "temperature",
    state: getRange({ idealMin: 23, idealMax: 30, warningMin: 21, warningMax: 35 }, avianTemp),
    value: avianTemp,
  };
  let avianHumidityStatus: EnclosureStatus = {
    enclosure: "AVIAN",
    condition: "humidity",
    state: getRange({ idealMin: 30, idealMax: 55, warningMin: 25, warningMax: 60 }, avianHumidity),
    value: avianHumidity,
  };
  let reptileTempStatus: EnclosureStatus = {
    enclosure: "REPTILE",
    condition: "temperature",
    state: getRange({ idealMin: 22, idealMax: 28, warningMin: 20, warningMax: 32 }, reptileTemp),
    value: reptileTemp,
  };
  let reptileHumidityStatus: EnclosureStatus = {
    enclosure: "REPTILE",
    condition: "humidity",
    state: getRange(
      { idealMin: 30, idealMax: 70, warningMin: 25, warningMax: 75 },
      reptileHumidity
    ),
    value: reptileHumidity,
  };

  const hatcheryState = [
    avianTempStatus,
    avianHumidityStatus,
    reptileTempStatus,
    reptileHumidityStatus,
  ];

  const criticalReadings: EnclosureStatus[] = [];
  const warningReadings: EnclosureStatus[] = [];

  hatcheryState.forEach((reading) => {
    if (reading.state === "critical") {
      criticalReadings.push(reading);
    } else if (reading.state === "warning") {
      warningReadings.push(reading);
    }
  });

  let readingState: ReadingStatus = {
    state: "ideal",
    message: null,
  };

  if (criticalReadings.length > 0) {
    readingState = {
      state: "critical",
      message: generateSms(
        "critical",
        criticalReadings[0].enclosure,
        criticalReadings[0].condition,
        criticalReadings[0].value
      ),
    };
  } else if (warningReadings.length > 0) {
    readingState = {
      state: "warning",
      message: generateSms(
        "warning",
        warningReadings[0].enclosure,
        warningReadings[0].condition,
        warningReadings[0].value
      ),
    };
  }

  return readingState;
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
