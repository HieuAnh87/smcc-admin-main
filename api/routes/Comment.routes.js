import express from "express";

const router = express.Router();
import { getCommentsOfContent } from "../controllers/Comment.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/:contentId", authenticate(), getCommentsOfContent);

export default router;
