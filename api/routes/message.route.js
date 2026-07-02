import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
} from "../controllers/message.controller.js";
import verifyToken from "../utils/verifyUser.js";

const router = express.Router();

router.post("/send", verifyToken, sendMessage);
router.get("/conversations", verifyToken, getConversations);
router.get("/:id", verifyToken, getMessages);

export default router;
