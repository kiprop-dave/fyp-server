import client from "../config/mqttConfig";
import { EventEmitter } from "events";

const sirenEvent = new EventEmitter();

const startSiren = () => {
  console.log("trying to publish");
  client.publish("siren", "siren on", (err) => {
    console.log(err || "published");
  });
};

sirenEvent.on("alert", startSiren);

export default sirenEvent;
