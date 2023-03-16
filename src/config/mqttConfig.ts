import mqtt from "mqtt";
import generateClientId from "../utils/generateId";
import env from "../env";

/*
 * Setup MQTT client
 *ClientId is generated using the generateClientId function which takes a prefix string as an argument
  Setting the id dynamically ensures that the client id is unique
 *Username and password are used for authentication
 *Clean is set to true to ensure that the client and server start with a clean session every time
  and that no messages are saved from previous sessions
 *ConnectTimeout is set to 4 seconds. If the client cannot connect to the server within 4 seconds,
  it will throw an error
 *Keepalive is set to 60 seconds. This is the interval at which the client will send a ping to the server
  to check if the connection is still alive
 */
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
