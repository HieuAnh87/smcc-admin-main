import express from "express";

const router = express.Router();
import {
  getHistory,
  addHistory,
  deleteHistory,
} from "../controllers/History.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(['SUPER_ADMIN']), getHistory);

router.post("/", authenticate(), addHistory);

router.delete("/:id", authenticate(['SUPER_ADMIN']), deleteHistory);

export default router;
