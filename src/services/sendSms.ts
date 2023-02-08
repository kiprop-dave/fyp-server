// Send sms using Twilio
import twilio from "twilio";
import sirenEvent from "./sirenAlert";
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const phoneNumber = process.env.TWILIO_NUMBER;

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
      console.log(`message sent ${this.timesSent} times`);
      return true;
    } else if (now - this.lastSent > 20 * 60 * 1000) {
      this.reset();
    } else if (now - this.lastSent < 20 * 60 * 1000 && this.timesSent >= 3) {
      sirenEvent.emit("alert");
      this.isSirenOn = true;
    }
    return false;
  }

  reset() {
    this.lastSent = new Date().getTime();
    this.timesSent = 0;
    this.isSirenOn = false;
  }
}

const alerts = new SmsTracker();

type smsResponse = {
  error: boolean;
  sent: "YES" | "NO";
};

async function sendSms(to: string, message: string): Promise<smsResponse> {
  if (!accountSid || !authToken || !phoneNumber) {
    return { error: true, sent: "NO" };
  }
  const client = twilio(accountSid, authToken);
  try {
    let canSend = alerts.send();
    if (canSend) {
      // await client.messages.create({
      //   body: message,
      //   to: to,
      //   from: phoneNumber,
      // });
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
