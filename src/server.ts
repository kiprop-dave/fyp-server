import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import client from "./config/mqttConfig";
import connectToMongo from "./config/dbConfig";
import { storeReading } from "./controllers/readingsController";
import { ReadingSchema } from "./types/types";
import adminRoute from "./routes/login";
import readingsRoute from "./routes/api/readings";
import { reset } from "./services/sendSms";
// import logRequest from "./middleware/requestLog";

const app = express();
const port = process.env.PORT || 5000;

connectToMongo();

// app.use(logRequest);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/readings", readingsRoute);

app.use("/admin", adminRoute);

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  client.subscribe(["readings", "/siren/off"], (err) => {
    console.log(err || "Subscribed to topics");
  });
});

client.on("message", (topic, message) => {
  // console.log("Message received on topic: " + topic);
  // console.log("Message: " + message.toString());
  if (topic === "readings") {
    const data = {
      timestamp: new Date(),
      reading: JSON.parse(message.toString()),
    };
    let reading = ReadingSchema.parse(data);
    storeReading(reading);
  } else if (topic === "/siren/off") {
    reset();
  }
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
