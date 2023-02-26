import mqtt from "mqtt";
import generateClientId from "../utils/generateId";

// Set up MQTT client
const tcpUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const connectionOptions: mqtt.IClientOptions = {
  clientId: generateClientId("Node"),
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clean: true,
  connectTimeout: 4000,
  keepalive: 60,
};
const client = mqtt.connect(tcpUrl, connectionOptions);

export default client;
