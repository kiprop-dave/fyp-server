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
  const avianProblem = t1 > 25 || t1 < 24 || h1 > 40 || h1 < 36;
  const reptProblem = t2 > 26 || t2 < 25 || h2 > 45 || h2 < 40;

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
async function getReadings(req: Request, res: Response) {
  const temperatureReadings = await readingModel
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
          sensorOne: {
            $avg: "$reading.sensorOne.temperature",
          },
          sensorTwo: {
            $avg: "$reading.sensorTwo.temperature",
          },
        },
      },
    ])
    .sort({ _id: 1 });
  const humidityReadings = await readingModel
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
          sensorOne: {
            $avg: "$reading.sensorOne.humidity",
          },
          sensorTwo: {
            $avg: "$reading.sensorTwo.humidity",
          },
        },
      },
    ])
    .sort({ _id: 1 });
  return res.json({ temperatureReadings, humidityReadings });
}

export { storeReading, getReadings };
