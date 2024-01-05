import express from "express";

const router = express.Router();
import { getFbAccounts, addFbAccount, updateFbAccount, deletFbAccount } from "../controllers/FbAccount.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getFbAccounts);

router.post("/", authenticate(), addFbAccount);

router.put("/:id", authenticate(), updateFbAccount);

router.delete("/:id", authenticate(), deletFbAccount);

export default router;
