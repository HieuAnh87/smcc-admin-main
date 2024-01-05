import express from "express";

const router = express.Router();
import { getAuthors, getAuthor, updateAuthor } from "../controllers/Author.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getAuthors);
router.get("/:id", authenticate(), getAuthor);
router.put("/:id", authenticate(), updateAuthor);

export default router;
