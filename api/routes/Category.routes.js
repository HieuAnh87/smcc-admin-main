import express from "express";

const router = express.Router();
import {
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deletCategory

} from "../controllers/Category.controller.js";
router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

router.post("/", addCategory);

router.put("/:id", updateCategory);

router.delete("/:id", deletCategory);

export default router;