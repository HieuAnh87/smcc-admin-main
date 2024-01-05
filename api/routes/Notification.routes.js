import express from "express";

const router = express.Router();
import {
  getNotifications,
  updateNotification,
  deleteNotification,
} from "../controllers/Notification.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getNotifications);

router.put("/:id", authenticate(), updateNotification);

router.delete("/:id", authenticate(['SUPER_ADMIN']), deleteNotification);

export default router;
