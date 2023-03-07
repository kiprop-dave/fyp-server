// Controller to store and retrieve readings from the database
import { Request, Response } from "express";
import readingModel from "../models/Reading";
import { Reading } from "../types/types";
import { sendSms } from "../services/sendSms";

type Unit = "avian" | "reptilian";
// Generate Message
const generateSms = (temp: number, hum: number, unit: Unit): string => {
  let msg = `There is a problem in the ${unit} unit. Temperature is ${temp}. Humidity is ${hum}%`;
  return msg;
};

// Store a reading from MQTT in the database
async function storeReading(reading: Reading) {
  const newReading = new readingModel(reading);
  await newReading.save();
  const { humidity: h1, temperature: t1 } = reading.reading.sensorOne;
  const { humidity: h2, temperature: t2 } = reading.reading.sensorTwo;

  let message = "";
  const avianProblem = t1 > 30 || t1 < 23 || h1 > 55 || h1 < 30;
  const reptProblem = t2 > 28 || t2 < 22 || h2 > 70 || h2 < 30;

  if (!avianProblem && !reptProblem) return;

  if (avianProblem) {
    message = generateSms(t1, h1, "avian");
  } else if (reptProblem) {
    message = generateSms(t2, h2, "reptilian");
  }

  // TODO: Add phone number as an environment variable
  // TODO:Do some error handling
  let res = await sendSms("07xxxxxxxx", message);
  if (res.error) {
    console.log("error");
  }
}

// Get readings of the last 24 hours and find the average of each hour
async function getDayReadings(req: Request, res: Response) {
  try {
    const dayReadings = await readingModel
      .aggregate([
        {
          $match: {
            timestamp: {
              $gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d %H:00:00",
                timezone: "+03:00",
                date: "$timestamp",
              },
            },
            avianTemp: {
              $avg: "$reading.sensorOne.temperature",
            },
            avianHum: {
              $avg: "$reading.sensorOne.humidity",
            },
            reptTemp: {
              $avg: "$reading.sensorTwo.temperature",
            },
            reptHum: {
              $avg: "$reading.sensorTwo.humidity",
            },
          },
        },
      ])
      .sort({ _id: 1 });
    return res.json({ readings: dayReadings });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}

/*
 *Function to find the past week's readings and find the average of each day
 */
async function getWeekReadings(req: Request, res: Response) {
  try {
    const weekReadings = await readingModel
      .aggregate([
        {
          $match: {
            timestamp: {
              $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                timezone: "+03:00",
                date: "$timestamp",
              },
            },
            avianTemp: {
              $avg: "$reading.sensorOne.temperature",
            },
            avianHum: {
              $avg: "$reading.sensorOne.humidity",
            },
            reptTemp: {
              $avg: "$reading.sensorTwo.temperature",
            },
            reptHum: {
              $avg: "$reading.sensorTwo.humidity",
            },
          },
        },
      ])
      .sort({ _id: 1 });
    return res.json({ readings: weekReadings });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    }
  }
}

export { storeReading, getDayReadings, getWeekReadings };
