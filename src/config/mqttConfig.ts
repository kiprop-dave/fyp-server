import mqtt from "mqtt";
import generateClientId from "../utils/generateId";
import env from "../env";

// Set up MQTT client
const tcpUrl = env.MQTT_URL;
const connectionOptions: mqtt.IClientOptions = {
  clientId: generateClientId("Node"),
  username: env.MQTT_USERNAME,
  password: env.MQTT_PASSWORD,
  clean: true,
  connectTimeout: 4000,
  keepalive: 60,
};
const client = mqtt.connect(tcpUrl, connectionOptions);

export default client;
