import express from "express";

const router = express.Router();
import {
  getTags,
  addTag,
  updateTag,
  deleteTag,
} from "../controllers/Tag.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getTags);

router.post("/", authenticate(), addTag);

router.put("/:id", authenticate(), updateTag);

router.delete("/:id", authenticate(), deleteTag);

export default router;
