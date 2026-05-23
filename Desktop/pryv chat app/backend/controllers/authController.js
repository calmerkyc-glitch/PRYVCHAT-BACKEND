import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../services/emailService.js";
import { sendOtpSms } from "../services/smsService.js";

const createTag = async () => {
  let tag;
  let exists = true;
  while (exists) {
    tag = `@pryv${Math.floor(1000 + Math.random() * 9000)}`;
    exists = await User.exists({ tag });
  }
  return tag;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: "Name plus email or phone is required." });
    }

    if (email && phone) {
      return res.status(400).json({ error: "Enter either email or phone, not both." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const query = [];
    if (email) query.push({ email: email.toLowerCase().trim() });
    if (phone) query.push({ phone: phone.trim() });

    let user = await User.findOne({ $or: query });
    if (!user) {
      user = await User.create({
        name,
        email: email?.toLowerCase().trim(),
        phone: phone?.trim(),
        otp,
        otpExpires,
      });
    } else {
      user.name = name || user.name;
      user.otp = otp;
      user.otpExpires = otpExpires;
      user.verified = false;
      await user.save();
    }

    if (email) await sendOtpEmail(email, otp);
    if (phone) await sendOtpSms(phone, otp);

    return res.json({ message: "OTP sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to send OTP." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { name, email, phone, otp } = req.body;
    if (!otp || (!email && !phone)) {
      return res.status(400).json({ error: "OTP and email or phone are required." });
    }

    if (email && phone) {
      return res.status(400).json({ error: "Enter either email or phone, not both." });
    }

    const query = [];
    if (email) query.push({ email: email.toLowerCase().trim() });
    if (phone) query.push({ phone: phone.trim() });

    const user = await User.findOne({ $or: query });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP." });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({ error: "OTP expired." });
    }

    user.name = name || user.name;
    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    if (!user.tag) {
      user.tag = await createTag();
    }
    await user.save();

    const token = jwt.sign(
      { id: user._id, tag: user.tag, name: user.name, email: user.email, phone: user.phone }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      tag: user.tag,
    }, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to verify OTP." });
  }
};
