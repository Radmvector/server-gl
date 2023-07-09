import fs from "fs-extra";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import BookingPayment from "../models/BookingPayment.js";
import Rooms from "../models/Room.js";
import Users from "../models/User.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getBookingPayments = async (req, res) => {
  try {
    const response = await BookingPayment.find()
      .populate({
        path: "roomId",
        select: "roomNumber roomTag",
      })
      .populate({
        path: "userId",
        select: "name email",
      });
    res.status(200).json({
      message: "Berhasil mendapatkan data pembayaran",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await BookingPayment.findOne({ _id: id });

    res.status(200).json({
      message: "Berhasil mendapatkan data pembayaran",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBookingPayment = async (req, res) => {
  try {
    const userId = req.session.userId;

    const { roomId } = req.body;

    const room = await Rooms.findOne({ _id: roomId });

    await BookingPayment.create({
      userId,
      roomId,
      roomName: `${room.roomNumber} - ${room.roomTag}`,
      imgUrl: `images/${req.file.filename}`,
    });
    res.status(201).json({
      message:
        "Berhasil menambah pembayaran, silakan menunggu persetujuan admin",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateBookingPayment = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.session;

  const bookingPayment = await BookingPayment.findOne({ _id: id });
  const oldImgUrl = bookingPayment?.imgUrl;

  const isEquals = bookingPayment?.userId.equals(userId);

  if (!isEquals) {
    return res.status(401).json({
      message: "Tidak diizinkan",
    });
  } else {
    try {
      await BookingPayment.findByIdAndUpdate(
        { _id: id },
        {
          imgUrl: `images/${req.file.filename}`,
          status: "pending",
        }
      ).then(() => {
        fs.unlink(path.join(__dirname, `../public/${oldImgUrl}`));
        res.status(201).json({
          message:
            "Berhasil memperbarui file, silakan menunggu persetujuan admin",
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const validateBookingPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const bookingPayment = await BookingPayment.findOne({ _id: id });

    const paymentDate = new Date(bookingPayment.createdAt);
    const expiredDate = new Date(
      paymentDate.setDate(paymentDate.getDate() + 7)
    );

    let validatedPayment = {};

    if (status === "accept") {
      validatedPayment = {
        status,
        note: `Booking berhasil, silakan melakukan pelunasan sebelum ${expiredDate
          .toString()
          .slice(0, 10)}`,
        imgUrl: "images/success.png",
        userId: null,
      };
      await BookingPayment.findByIdAndUpdate(id, validatedPayment);
      await Rooms.findByIdAndUpdate(bookingPayment.roomId, {
        userId: bookingPayment.userId,
        checkInDate: new Date(),
        isEmpty: false,
        isPaid: true,
        isBooked: true,
        expiredDate,
        price: 400000,
      });

      await Users.findByIdAndUpdate(bookingPayment.userId, {
        userStatus: "member",
        roomId: bookingPayment.roomId,
      });

      await fs.unlink(
        path.join(__dirname, `../public/${bookingPayment.imgUrl}`)
      );
    } else {
      validatedPayment = {
        status,
        note,
      };
      await BookingPayment.findByIdAndUpdate(id, validatedPayment);
    }
    res.status(201).json({
      message: "Berhasil memperbarui status pembayaran",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingPaymentByUser = async (req, res) => {
  try {
    const userId = req.session.userId;

    const response = await BookingPayment.findOne({ userId });

    res.status(200).json({
      message: "Berhasil mendapatkan data pembayaran",
      data: response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
