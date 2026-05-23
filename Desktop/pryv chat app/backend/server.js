import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import Message from "./models/Message.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
  await connectDB();

  app.use("/api/auth", authRoutes);
  app.use("/api/chat", chatRoutes);

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendMessage", async (msg) => {
      try {
        const message = new Message({
          senderTag: msg.senderTag,
          receiverTag: msg.receiverTag,
          content: msg.content,
        });
        await message.save();
        io.emit("receiveMessage", message);
      } catch (error) {
        console.error("Failed to save chat message", error);
      }
    });
  });

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
