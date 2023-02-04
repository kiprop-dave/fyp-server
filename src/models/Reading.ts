// Schema and model for a time series reading
import { Schema, model } from "mongoose";
import { Reading } from "../types/types";

const ReadingSchema = new Schema<Reading>(
  {
    timestamp: { type: Date, required: true },
    reading: {
      sensorOne: {
        temperature: { type: Number, required: true },
        humidity: { type: Number, required: true },
      },
      sensorTwo: {
        temperature: { type: Number, required: true },
        humidity: { type: Number, required: true },
      },
    },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "reading",
      granularity: "seconds",
    },
  }
);

const readingModel = model<Reading>("Reading", ReadingSchema);

export default readingModel;
