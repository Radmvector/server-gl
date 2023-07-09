import express from "express";
import {
  createUser,
  createUserClient,
  deleteUser,
  getUser,
  getUsers,
  updateTemporaryRoomId,
  updateUser,
  updateUserClient,
} from "../controllers/Users.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/", verifyUser, adminOnly, getUsers);
router.get("/user/:id", verifyUser, adminOnly, getUser);
router.post("/", verifyUser, adminOnly, createUser);
router.post("/client", createUserClient);
router.patch("/temp-update", verifyUser, updateTemporaryRoomId);
router.patch("/:id", verifyUser, adminOnly, updateUser);
router.patch("/client/:id", verifyUser, updateUserClient);
router.delete("/:id", verifyUser, adminOnly, deleteUser);

export default router;
