import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  tag: { type: String, unique: true, sparse: true },
  otp: String,
  otpExpires: Date,
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
