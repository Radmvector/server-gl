import express from "express";
import {
  createClientPayment,
  createPayment,
  deletePayment,
  editClientPayment,
  getClientPayments,
  getPayment,
  getPayments,
  validatePayment,
} from "../controllers/Payments.js";
import { adminOnly, memberOnly, verifyUser } from "../middleware/AuthUser.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/", adminOnly, verifyUser, getPayments);
router.get("/client", verifyUser, memberOnly, getClientPayments);
router.post("/", verifyUser, adminOnly, createPayment);
router.post("/client", verifyUser, memberOnly, upload, createClientPayment);
router.get("/:id", verifyUser, getPayment);
router.patch("/:id", verifyUser, upload, editClientPayment);
router.patch("/validate/:id", verifyUser, adminOnly, validatePayment);
router.delete("/:id", verifyUser, adminOnly, deletePayment);

export default router;
