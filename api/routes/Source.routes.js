import express from "express";

const router = express.Router();
import { getSources, getSourceById, addSources, updateSource, deleteSource, getSourceHaveLessContent } from "../controllers/Source.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", getSources);
router.get("/content/lessContent", getSourceHaveLessContent);

router.get("/:id", getSourceById);

router.post("/", authenticate(), addSources);

router.put("/:id", updateSource);

router.delete("/:id", authenticate(), deleteSource);

export default router;
