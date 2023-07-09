import MongoStore from "connect-mongo";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import AuthRoute from "./routes/AuthRoute.js";
import BookingPaymentRoute from "./routes/BookingPaymentRoute.js";
import FinancialRoute from "./routes/FinancialRoute.js";
import MaintenanceRoute from "./routes/MaintenanceRoute.js";
import PaymentRoute from "./routes/PaymentRoute.js";
import RoomRoute from "./routes/RoomRoute.js";
import UserRoute from "./routes/UserRoute.js";
import "./scheduler/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
});

app.use(
  session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { secure: "auto", maxAge: 259200000 },
  })
);

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use("/users", UserRoute);
app.use("/payments", PaymentRoute);
app.use("/maintenances", MaintenanceRoute);
app.use("/rooms", RoomRoute);
app.use("/auth", AuthRoute);
app.use("/financials", FinancialRoute);
app.use("/booking-payments", BookingPaymentRoute);

app.use("/public", express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    app.listen(process.env.APP_PORT, () => {
      console.log(`Server running on port ${process.env.APP_PORT}`);
    });
  })
  .catch((err) => console.log(err));
