import express from "express";

const router = express.Router();
import {
  getProfiles,
  addProfile,
  updateProfile,
  deleteProfile,
  getProfileById
} from "../controllers/Profile.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getProfiles);

router.get("/:id", authenticate(), getProfileById);

router.post("/", authenticate(), addProfile);

router.put("/:id", authenticate(), updateProfile);

router.delete("/:id", authenticate(), deleteProfile);

export default router;
