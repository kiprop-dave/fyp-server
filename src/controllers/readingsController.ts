// Controller to store and retrieve readings from the database
import { Request, Response } from "express";
import readingModel from "../models/Reading";
import { Reading } from "../types/types";
import { sendSms } from "../services/sendSms";
import checkReading from "../services/checkReading";

// Store a reading from MQTT in the database
async function storeReading(reading: Reading) {
  const newReading = new readingModel(reading);
  await newReading.save();

  const readingStatus = checkReading(reading);

  if (readingStatus.state === "ideal") return;

  if (readingStatus.message) {
    if (readingStatus.state === "critical") {
      let res = await sendSms("07********", readingStatus.message, "critical");
      if (res.error) {
        console.log("Error sending sms");
      }
    } else {
      let res = await sendSms("07********", readingStatus.message, "warning");
      if (res.error) {
        console.log("Error sending sms");
      }
    }
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
