import express from "express";

const router = express.Router();
import { getCampaigns, addCampaign, updateCampaign, runCampaign, deleteCampaign } from "../controllers/Campaign.controller.js";
import { authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getCampaigns);

router.post("/", authenticate(), addCampaign);

router.put("/:id", authenticate(), updateCampaign);

router.put("/run/:id", authenticate(), runCampaign);

router.delete("/:id", authenticate(), deleteCampaign);

export default router;
