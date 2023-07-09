import fs from "fs-extra";
import path, { dirname } from "path";
import Payments from "../models/PaymentHistory.js";
import Rooms from "../models/Room.js";
import Users from "../models/User.js";

import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getPayments = async (req, res) => {
  try {
    const payments = await Payments.find();
    res.status(200).json({
      dataLength: payments.length,
      datas: payments,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPayment = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await Payments.findById(id);
    res.status(200).json(payment);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createPayment = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    const room = await Rooms.findOne({ _id: roomId });

    if (!room) {
      return res.status(404).json({ message: "Kamar tidak ditemukan" });
    }

    const today = new Date();
    const validateTodayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const thisRoomPaymentToday = await Payments.findOne({
      roomId: roomId,
      createdAt: {
        $gte: validateTodayDate,
        $lt: new Date(validateTodayDate.getTime() + 86400000),
      },
    });

    const admin = await Users.findOne({ _id: req.session.userId });

    if (thisRoomPaymentToday) {
      // Pembayaran sudah ada pada hari ini, lakukan update
      thisRoomPaymentToday.roomName = `${room?.roomNumber} - ${room?.roomTag}`;
      thisRoomPaymentToday.price = room?.price;
      thisRoomPaymentToday.isFromAdmin = true;
      thisRoomPaymentToday.status = "accept";
      thisRoomPaymentToday.imgUrl = "images/success.png";
      thisRoomPaymentToday.note = `disetujui oleh admin ${admin.name}`;

      await thisRoomPaymentToday.save();
      room.isPaid = true;
      room.save();

      return res.status(200).json({
        message: "Pembayaran sudah ada, berhasil melakukan update.",
        data: thisRoomPaymentToday,
      });
    } else {
      // Pembayaran belum ada pada hari ini, buat pembayaran baru

      const expiredDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      );

      const newPayment = new Payments({
        roomId: roomId,
        roomName: `${room?.roomNumber} - ${room?.roomTag}`,
        price: room?.price,
        userId: userId,
        expiredDate: expiredDate,
        isFromAdmin: true,
        status: "accept",
        imgUrl: "images/success.png",
        note: `disetujui oleh admin ${admin.name}`,
      });

      await newPayment.save();
      room.isPaid = true;
      room.save();

      return res.status(201).json({
        message: "Berhasil menambahkan pembayaran baru.",
        data: newPayment,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePayment = async (req, res) => {
  const { id } = req.params;

  const payment = await Payments.findById(id);
  if (!payment) return res.status(404).send(`Tidak ada data dengan id ${id}`);

  const room = await Rooms.findOne({ _id: payment.roomId });
  room.isPaid = false;
  room.expiredDate = null;

  try {
    await room.save();
    await Payments.findByIdAndRemove(id);
    res.status(200).json({ message: "Berhasil menghapus data" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const validatePayment = async (req, res) => {
  // declare admin name
  const admin = await Users.findOne({ _id: req.session.userId });

  const { id } = req.params;

  const { status, note } = req.body;

  const payment = await Payments.findById(id);
  if (!payment) return res.status(404).send(`Tidak ada data dengan id ${id}`);

  // console.log({ before: payment });

  let validatedPayment = {};

  const paymentDate = new Date(payment.createdAt);
  const expiredDate = new Date(
    paymentDate.getFullYear(),
    paymentDate.getMonth() + 1,
    paymentDate.getDate()
  );

  if (status === "accept") {
    validatedPayment = {
      status,
      note: `disetujui oleh admin ${admin.name}`,
      imgUrl: "images/success.png",
    };
    const room = await Rooms.findOne({ _id: payment.roomId });
    const newPrice = room.price + 100000;

    if (room.isBooked) {
      await Rooms.findByIdAndUpdate(payment.roomId, {
        isPaid: true,
        isBooked: false,
        expiredDate: expiredDate,
        price: newPrice,
      });
    } else {
      await Rooms.findByIdAndUpdate(payment.roomId, {
        isPaid: true,
        isBooked: false,
        expiredDate: expiredDate,
      });
    }
    await fs.unlink(path.join(__dirname, `../public/${payment.imgUrl}`));
  } else {
    validatedPayment = {
      status,
      note,
    };
  }

  try {
    // console.log({ status, after: payment });
    await Payments.findByIdAndUpdate(id, validatedPayment);
    res.status(200).json({ message: "Berhasil" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// Client Payment - MEMBER ONLY
// #############################################################

export const getClientPayments = async (req, res) => {
  const memberId = req.session.userId;

  try {
    const payments = await Payments.find({ userId: memberId }).populate({
      path: "roomId",
      select: "roomNumber roomTag",
    });
    res.status(200).json({
      dataLength: payments.length,
      datas: payments,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createClientPayment = async (req, res) => {
  // Deklarasikan ID member
  const memberId = req.session.userId;

  // Dapatkan ID ruangan
  const memberRoomId = await Users.findOne({ _id: memberId }, "roomId");
  const roomId = memberRoomId.roomId._id;
  const room = await Rooms.findOne({ _id: roomId });
  const roomName = `${room.roomNumber}${room.roomTag}`; // Tambahkan roomName

  // Deklarasikan harga ruangan
  const roomPrice = room.price;

  // Buat pembayaran baru
  const newPayment = new Payments({
    imgUrl: `images/${req.file.filename}`,
    roomId,
    roomName, // Tambahkan roomName
    price: roomPrice,
    userId: memberId,
    status: "pending",
    note: `menunggu konfirmasi dari admin`,
  });

  try {
    await newPayment.save();
    // console.log(newPayment, room);
    res.status(201).json({
      message:
        "Berhasil menambah pembayaran, silakan menunggu persetujuan admin",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const editClientPayment = async (req, res) => {
  // Deklarasikan ID Payment
  const { id } = req.params;
  const payment = await Payments.findOne({ _id: id });

  const oldImgUrl = payment.imgUrl;

  const imgUrl = `images/${req.file.filename}`;
  const status = "pending";

  try {
    await Payments.findByIdAndUpdate(id, { imgUrl, status });
    await fs.unlink(path.join(__dirname, `../public/${oldImgUrl}`));
    // console.log(newPayment, room);
    res.status(201).json({
      message: "Berhasil memperbarui file, silakan menunggu persetujuan admin",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
