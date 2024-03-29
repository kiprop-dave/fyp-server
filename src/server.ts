import dotenv from "dotenv";
dotenv.config();
import env from "./env";
import express from "express";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import client from "./config/mqttConfig";
import connectToMongo from "./config/dbConfig";
import { storeReading } from "./controllers/readingsController";
import { MqttReadingSchema, mqttMesageSchema } from "./types/types";
import adminRoute from "./routes/login";
import readingsRoute from "./routes/api/readings";
import { reset } from "./services/sendSms";
// import logRequest from "./middleware/requestLog";

const app = express();
const port = env.PORT;

connectToMongo();

/*
 *The cors middleware is used to allow selected origins to access the API
 */
app.use(cors(corsOptions));

/*
 *The express.json() and express.urlencoded() middleware are used to parse incoming requests with JSON payloads and URL-encoded payloads
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 *The "/api/readings" route is used to access the readings
 */
app.use("/api/readings", readingsRoute);

/*
 *The "/admin" route is used to access the admin routes
 */
app.use("/admin", adminRoute);

/*
 *This will catch all requests that are not defined in the routes
 */
app.all("*", (req, res) => {
  res.sendStatus(404);
});

client.on("connect", () => {
  console.log("Connected to MQTT broker");

  client.subscribe(["readings", "/siren/off"], (err) => {
    console.log(err || "Subscribed to topics");
  });
});

const parseReading = (message: Buffer) => {
  try {
    // Parse the message to make it type safe
    // console.log(message.toString());
    const mqttMessage = mqttMesageSchema.parse(JSON.parse(message.toString()));
    const data = {
      timestamp: new Date(),
      ...mqttMessage,
    };
    storeReading(data);
  } catch (error) {
    // console.log(error);
    return;
  }
};

client.on("message", (topic, message) => {
  if (topic === "readings") {
    // This is the topic that the MCU publishes the readings to
    parseReading(message);
  } else if (topic === "/siren/off") {
    /* This is the topic that the MCU publishes to when it turns off the siren and
     * when it is powered
     * This is used to reset the SMS tracker
     */
    // console.log("reset warning tracker")
    reset();
  }
});

app.listen(port, () => console.log(`Server is running on port: ${port}`));
