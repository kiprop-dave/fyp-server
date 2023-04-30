// Controller to store and retrieve readings from the database
import { Request, Response } from "express";
import client from "../config/mqttConfig";
import readingModel from "../models/Reading";
import { MqttReading } from "../types/types";
import { sendSms } from "../services/sendSms";
import { generateSms } from "../services/generateSms";
import env from "../env";

/*Store a reading from MQTT in the database
 *The checkReading function is used to check the status of the readings
 *It returns a generated message if the readings are not ideal
 *The sendSms function is used to send the generated message to the attendant
 */
async function storeReading(reading: MqttReading) {
  const newReading = new readingModel({
    timestamp: reading.timestamp,
    reading: {
      avian: reading.avian,
      reptilian: reading.reptilian,
    },
  });
  await newReading.save();

  if (reading.status.decision === "ideal") return;

  const unit = reading.status.enclosure[0];
  const problem = reading.status.enclosure[1];

  if (!unit.length || !problem.length) return;

  const message = generateSms(reading, unit, problem);

  client.publish("message/alert", message);

  if (reading.status.decision === "critical") {
    let res = await sendSms(env.PHONE_NUMBER, message, "critical");
    if (res.error) {
      console.log("Error sending sms");
    }
  } else {
    let res = await sendSms(env.PHONE_NUMBER, message, "warning");
    if (res.error) {
      console.log("Error sending sms");
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
              $avg: "$reading.avian.temperature",
            },
            avianHum: {
              $avg: "$reading.avian.humidity",
            },
            reptTemp: {
              $avg: "$reading.reptilian.temperature",
            },
            reptHum: {
              $avg: "$reading.reptilian.humidity",
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
              $avg: "$reading.avian.temperature",
            },
            avianHum: {
              $avg: "$reading.avian.humidity",
            },
            reptTemp: {
              $avg: "$reading.reptilian.temperature",
            },
            reptHum: {
              $avg: "$reading.reptilian.humidity",
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
