import express from "express";
// Important: In ES Modules, you often need to include the .js extension for local files
import { handleChatGroq } from "../controller/chatController.js";

const router = express.Router();

// Định nghĩa route POST
router.post("/message", handleChatGroq);

export default router;
