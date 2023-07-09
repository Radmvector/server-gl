import express from "express";
import {
  getCustomDateFinancials,
  getFinancials,
  getFinancialsByMonthAndYear,
  getLastWeekFinancials,
  getMonthFinancials,
  getTodayFinancials,
  getWeekFinancials,
} from "../controllers/Financials.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getFinancials);
router.get("/today", verifyUser, adminOnly, getTodayFinancials);
router.get("/week", verifyUser, adminOnly, getWeekFinancials);
router.get("/last-week", verifyUser, adminOnly, getLastWeekFinancials);
router.get("/month", verifyUser, adminOnly, getMonthFinancials);
router.get("/:month/:year", verifyUser, adminOnly, getFinancialsByMonthAndYear);
router.post("/date", verifyUser, adminOnly, getCustomDateFinancials);

export default router;
