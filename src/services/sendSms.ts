// Send sms using Twilio
import twilio from "twilio";
import sirenEvent from "./sirenAlert";
import { SmsResponse, Decision } from "../types/types";
import env from "../env";
const accountSid = env.TWILIO_SID;
const authToken = env.TWILIO_TOKEN;
const phoneNumber = env.TWILIO_NUMBER;

/*
 *This is a class that keeps track of the number of warning messages sent within a specified time frame.
 *It also keeps track of the last time a warning message was sent.
 *It also holds the state of the siren.
 *A message can only be sent if the last message was sent more than 5 minutes ago, less than 20 minutes ago,
 *the number of messages sent is less than 3 and the siren is off.
 *If the last message was sent more than 20 minutes ago and the siren is off,the reset method is called.
 *An MQTT message is sent to the MCU to turn on the siren if 3 warning messages have been sent and the siren is off.
 *The reset method is called when the MCU turns off the siren,when a critical reading is detected or
 *when the last message was sent more than 20 minutes ago.
 *Whenever the MCU is powered,the reset method is called with the critical parameter set to false.
 */
class SmsTracker {
  private lastSent: number;
  private timesSent: number;
  private isSirenOn: boolean;
  constructor() {
    this.lastSent = new Date().getTime();
    this.timesSent = 0;
    this.isSirenOn = false;
  }

  // This method checks if a message can be sent
  private canSend(): boolean {
    let now = new Date().getTime();
    let allowed =
      now - this.lastSent > 5 * 60 * 1000 &&
      now - this.lastSent < 20 * 60 * 1000 &&
      this.timesSent < 3 &&
      !this.isSirenOn;
    if (allowed) {
      return true;
    }
    return false;
  }

  send(): boolean {
    let now = new Date().getTime();
    if (this.canSend()) {
      this.lastSent = now;
      this.timesSent += 1;
      console.log(`warning message sent ${this.timesSent} times`);
      return true;
    } else if (now - this.lastSent > 20 * 60 * 1000 && !this.isSirenOn) {
      this.reset();
    } else if (now - this.lastSent < 20 * 60 * 1000 && this.timesSent >= 3 && !this.isSirenOn) {
      sirenEvent.emit("alert");
      this.isSirenOn = true;
    }
    return false;
  }

  peekSiren(): boolean {
    return this.isSirenOn;
  }

  reset(critical: boolean = false) {
    this.lastSent = new Date().getTime();
    this.timesSent = 0;
    if (critical) {
      this.isSirenOn = true;
      return;
    }
    this.isSirenOn = false;
  }
}

const alerts = new SmsTracker();

/*
 *This function sends an sms using Twilio.
 *It returns a promise that resolves to an object with two properties.
 *The two properties are error and sent. The error property is true if an error occured while sending the message.
 *The sent property is YES if the message was sent and NO if it was not sent.
 *There are two types of messages that can be sent, warning and critical.
 *Critical messages are sent immediately
 *Warning messages are sent depending on the state of the SmsTracker.
 */
async function sendSms(to: string, message: string, type: Decision): Promise<SmsResponse> {
  const client = twilio(accountSid, authToken);
  try {
    if (type === "critical") {
      // let res = await client.messages.create({
      //   body: message,
      //   to: to,
      //   from: phoneNumber,
      // });
      let sirenOn = alerts.peekSiren();
      if (!sirenOn) {
        alerts.reset(true);
        console.log(`${type} message sent to ${to}`);
        return { error: false, sent: "YES" };
      } else {
        return { error: false, sent: "NO" };
      }
    }
    let canSend = alerts.send();
    if (canSend) {
      // let {} =   await client.messages.create({
      //     body: message,
      //     to: to,
      //     from: phoneNumber,
      //   });
      console.log(`${message} has been sent to ${to}`);
      return { error: false, sent: "YES" };
    }
    return { error: false, sent: "NO" };
  } catch (err) {
    console.log(err);
    return { error: true, sent: "NO" };
  }
}

function reset(critical: boolean = false) {
  alerts.reset(critical);
}

export { sendSms, reset };
