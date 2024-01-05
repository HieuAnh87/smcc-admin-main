import express from "express";

const router = express.Router();
import { getUsers, getUserByIdOrToken, addUser, updateUser, deleteUser, login, logout, authenticate } from "../controllers/User.controller.js";

router.get("/", authenticate(), getUsers);

router.get("/:value", authenticate(), getUserByIdOrToken);

router.post("/", addUser);

router.post("/login", login);

router.post("/logout", authenticate(), logout);

router.put("/:id", authenticate(), updateUser);

router.delete("/:id", authenticate(['SUPER_ADMIN']), deleteUser);

export default router;
