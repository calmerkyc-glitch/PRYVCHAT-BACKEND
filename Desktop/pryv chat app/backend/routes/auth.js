import express from "express";
import { registerUser, verifyOtp } from "../controllers/authController.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);

router.get("/users", verifyToken, async (req, res) => {
  try {
    const users = await User.find(
      { verified: true, _id: { $ne: req.user.id } },
      "name tag"
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
