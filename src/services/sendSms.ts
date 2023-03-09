// Send sms using Twilio
import twilio from "twilio";
import sirenEvent from "./sirenAlert";
import env from "../env";
const accountSid = env.TWILIO_SID;
const authToken = env.TWILIO_TOKEN;
const phoneNumber = env.TWILIO_NUMBER;

class SmsTracker {
  private lastSent: number;
  private timesSent: number;
  private isSirenOn: boolean;
  constructor() {
    this.lastSent = new Date().getTime();
    this.timesSent = 0;
    this.isSirenOn = false;
  }

  // Allow sending sms every 5 minutes
  private canSend(): boolean {
    let now = new Date().getTime();
    let allowed =
      now - this.lastSent > 5 * 60 * 1000 &&
      now - this.lastSent < 20 * 60 * 1000 &&
      this.timesSent < 3;
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
    } else if (now - this.lastSent > 20 * 60 * 1000) {
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
      sirenEvent.emit("alert");
      this.isSirenOn = true;
      return;
    }
    this.isSirenOn = false;
  }
}

const alerts = new SmsTracker();

type MessageType = "warning" | "critical";

type SmsResponse = {
  error: boolean;
  sent: "YES" | "NO";
};

async function sendSms(to: string, message: string, type: MessageType): Promise<SmsResponse> {
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

function reset() {
  alerts.reset();
}

export { sendSms, reset };
