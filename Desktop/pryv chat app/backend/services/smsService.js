import twilio from "twilio";
import axios from "axios";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendOtpSms = async (phone, otp) => {
  if (process.env.SMS_PROVIDER === "twilio") {
    await client.messages.create({
      body: `Your Pryv Chat OTP is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
  } else if (process.env.SMS_PROVIDER === "termii") {
    await axios.post("https://api.ng.termii.com/api/sms/send", {
      api_key: process.env.TERMII_KEY,
      to: phone,
      from: "PryvChat",
      sms: `Your OTP is ${otp}`,
      type: "plain",
    });
  } else if (process.env.SMS_PROVIDER === "mtn") {
    await axios.post("https://engage2.mtn.ng/api/sms/send", {
      apiKey: process.env.MTN_KEY,
      to: phone,
      message: `Your Pryv Chat OTP is ${otp}`,
    });
  }
};
