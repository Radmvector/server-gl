import express from "express";

import {
  addUserToRoom,
  createRoom,
  deleteRoom,
  deleteUserFromRoom,
  getRoom,
  getRoomByMember,
  getRooms,
  getRoomsGuest,
  updateRoom,
} from "../controllers/Rooms.js";
import { adminOnly, memberOnly, verifyUser } from "../middleware/AuthUser.js";
import { uploadMultiple } from "../middleware/multer.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getRooms);
router.get("/member/:id", verifyUser, getRoomByMember);
router.get("/guest", getRoomsGuest);
router.post("/", verifyUser, adminOnly, uploadMultiple, createRoom);
router.get("/:id", getRoom);
router.patch("/:id", verifyUser, adminOnly, uploadMultiple, updateRoom);
router.patch("/addmember/:id", verifyUser, adminOnly, addUserToRoom);
router.patch("/removemember/:id", verifyUser, adminOnly, deleteUserFromRoom);
router.delete("/:id", verifyUser, adminOnly, deleteRoom);

export default router;
