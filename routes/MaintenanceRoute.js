import express from "express";
import {
  createMaintenance,
  deleteMaintenance,
  getMaintenance,
  getMaintenances,
  updateMaintenance,
} from "../controllers/Maintenances.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getMaintenances);
router.post("/", verifyUser, adminOnly, createMaintenance);
router.get("/:id", verifyUser, adminOnly, getMaintenance);
router.patch("/:id", verifyUser, adminOnly, updateMaintenance);
router.delete("/:id", verifyUser, adminOnly, deleteMaintenance);

export default router;
