import express from "express";

const router = express.Router();
import {
  getSettings,
  updateSetting
} from "../controllers/NotificationSetting.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getSettings);

router.put("/:id", authenticate(), updateSetting);

export default router;
