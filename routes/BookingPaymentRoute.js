import express from "express";

import {
  createBookingPayment,
  getBookingPayment,
  getBookingPaymentByUser,
  getBookingPayments,
  updateBookingPayment,
  validateBookingPayment,
} from "../controllers/BookingPayment.js";
import { adminOnly, memberOnly, verifyUser } from "../middleware/AuthUser.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getBookingPayments);
router.get("/single/:id", verifyUser, getBookingPayment);
router.get("/client", verifyUser, getBookingPaymentByUser);
router.post("/", verifyUser, upload, createBookingPayment);
router.patch("/:id", verifyUser, upload, updateBookingPayment);
router.patch("/validate/:id", verifyUser, adminOnly, validateBookingPayment);

export default router;
