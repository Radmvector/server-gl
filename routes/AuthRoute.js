import express from "express";
import { Login, Logout, Me } from "../controllers/Auth.js";

const router = express.Router();

router.get("/", Me);
router.post("/", Login);
router.delete("/", Logout);

export default router;
