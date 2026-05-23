import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderTag: String,
  receiverTag: String,
  content: String,
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);

