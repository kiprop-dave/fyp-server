import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000"),
  MONGO_URL: z.string(),
  MQTT_URL: z.string(),
  MQTT_USERNAME: z.string(),
  MQTT_PASSWORD: z.string(),
  ACCESS_SECRET: z.string(),
  TWILIO_SID: z.string(),
  TWILIO_TOKEN: z.string(),
  TWILIO_NUMBER: z.string(),
  BROKER_URL: z.string(),
  PHONE_NUMBER: z.string(),
});

// This is used to validate the environment variables to make them type safe
const env = envSchema.parse(process.env);

export default env;
