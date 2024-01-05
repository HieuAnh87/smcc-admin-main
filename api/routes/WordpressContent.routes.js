import express from "express";

const router = express.Router();
import {
  getContents,
  getContent,
  addContent,
  updateContent,
  deleteContent,
} from "../controllers/WordpressContent.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get('/:slug', getContent)

router.get("/", authenticate(), getContents);

router.post("/", authenticate(), addContent);

router.put("/:id", authenticate(), updateContent);

router.delete("/:id", authenticate(), deleteContent);

export default router;
