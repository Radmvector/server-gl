import argon2 from "argon2";
import User from "../models/User.js";

export const Login = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    res.status(404).json({
      message: "User tidak ditemukan",
    });
  } else {
    const match = await argon2.verify(user.password, req.body.password);
    if (!match) {
      res.status(400).json({
        message: "Password salah",
      });
    } else {
      req.session.userId = user._id;
      const id = user._id;
      const name = user.name;
      const email = user.email;
      const userStatus = user.userStatus;
      const address = user.address;
      const phone = user.phone;
      const company = user.company;
      const roomId = user.roomId;
      res.status(200).json({
        message: "Login berhasil",
        data: {
          id,
          name,
          email,
          userStatus,
          address,
          phone,
          company,
          roomId,
        },
      });
    }
  }
};

export const Me = async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({
      message: "Silakan login terlebih dahulu",
    });
  } else {
    const user = await User.findOne({
      _id: req.session.userId,
    }).populate({
      path: "roomId",
      select: "roomNumber roomTag isPaid",
    });
    if (!user) {
      res.status(404).json({
        message: "User tidak ditemukan",
      });
    } else {
      res.status(200).json(user);
    }
  }
};

export const Logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(400).json({
        message: "Logout gagal",
      });
    } else {
      res.status(200).json({
        message: "Logout berhasil",
      });
    }
  });
};
