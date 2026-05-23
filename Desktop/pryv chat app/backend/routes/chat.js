import express from "express";
import Message from "../models/Message.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/messages/:userTag", verifyToken, async (req, res) => {
  try {
    const { userTag } = req.params;
    const messages = await Message.find({
      $or: [
        { senderTag: userTag },
        { receiverTag: userTag },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to fetch messages." });
  }
});

export default router;
