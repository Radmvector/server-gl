import fs from "fs-extra";
import path from "path";
import Image from "../models/Image.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

export const getRooms = async (req, res) => {
  try {
    if (req.userStatus === "admin") {
      const response = await Room.find().populate({
        path: "userId",
        select: "name email userStatus address phone company roomId",
      });
      res.status(200).json(response);
    } else {
      const response = await Room.find({
        _id: req.userId,
      });
      res.status(200).json(response);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await Room.findOne({ _id: id }).populate({
      path: "imageId",
      select: "imgUrl",
    });

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { roomNumber, roomTag } = req.body;
    const roomTAG = roomTag.toUpperCase();
    const rooms = await Room.findOne({ roomNumber, roomTag: roomTAG });

    const room_number = rooms?.roomNumber.toString();
    const room_tag = rooms?.roomTag;

    if (room_number !== roomNumber && room_tag !== roomTAG) {
      if (req.files.length > 0) {
        const room = await Room.create({ roomNumber, roomTag: roomTAG });

        for (let i = 0; i < req.files.length; i++) {
          const imgSave = await Image.create({ imgUrl: req.files[i].filename });
          room.imageId.push({ _id: imgSave._id });
          await room.save();
        }
        res.status(201).json({
          message: "Berhasil menambah kamar",
        });
      } else {
        res.status(400).json({
          message: "Tidak ada file yang diunggah",
        });
      }
    } else {
      res.status(400).json({
        message: "Kamar dengan data tersebut sudah digunakan",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({ _id: id }).populate({
      path: "imageId",
      select: "imgUrl",
    });

    if (req.files.length > 0) {
      for (let i = 0; i < room.imageId.length; i++) {
        const imageUpdate = await Image.findOne({
          _id: room.imageId[i]._id,
        });
        await fs.unlink(path.join(`public/images/${imageUpdate.imgUrl}`));
        imageUpdate.imgUrl = req.files[i].filename;
        await imageUpdate.save();
      }
      res.status(200).json({
        message: "Berhasil mengganti foto kamar",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  const room = await Room.findOne({ _id: id });

  try {
    if (room.userId.length >= 1) {
      res.status(400).json({
        message: "Kamar masih digunakan oleh pengguna",
      });
    } else {
      await Room.findOneAndDelete({ _id: id });
      res.status(200).json({ message: "Berhasil menghapus kamar" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addUserToRoom = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const room = await Room.findOne({ _id: id });

  const roomPrice = () => {
    return room.userId.length >= 1 ? room.price + 100_000 : room.price;
  };

  const price = roomPrice();

  try {
    await Room.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          userId: userId,
        },
        $set: {
          price: price,
        },
      }
    );

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          roomId: id,
          temporaryRoomId: id,
          userStatus: "member",
        },
      }
    );

    res.status(200).json({ message: "User berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserFromRoom = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const room = await Room.findOne({ _id: id });

  const roomPrice = () => {
    if (room.userId.length > 1) {
      return room.price - 100_000;
    } else {
      return 500_000;
    }
  };

  const roomIsEmpty = () => {
    return room.userId.length <= 1
      ? (room.isEmpty = true)
      : (room.isEmpty = false);
  };

  const roomCheckInDate = () => {
    return room.userId.length <= 1
      ? (room.checkInDate = null)
      : room.checkInDate;
  };

  const roomExpiredDate = () => {
    return room.userId.length <= 1
      ? (room.expiredDate = null)
      : room.expiredDate;
  };

  const roomIsPaid = () => {
    return room.userId.length <= 1
      ? (room.isPaid = false)
      : (room.isPaid = true);
  };

  const isPaid = roomIsPaid();
  const expiredDate = roomExpiredDate();
  const checkInDate = roomCheckInDate();
  const isEmpty = roomIsEmpty();
  const price = roomPrice();

  try {
    await Room.findOneAndUpdate(
      { _id: id },
      {
        $pull: {
          userId: userId,
        },
        $set: {
          checkInDate: checkInDate,
          expiredDate: expiredDate,
          isEmpty: isEmpty,
          price: price,
          isPaid: isPaid,
        },
      }
    );

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          userStatus: "ex",
        },
        $unset: {
          roomId: null,
        },
      }
    );

    res.status(200).json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ##############################
// ##############################

export const getRoomByMember = async (req, res) => {
  const { id } = req.params;
  const userId = id;
  try {
    const response = await Room.findOne({
      userId: { $in: [userId] },
    });
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: "Kamar tidak ditemukan" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRoomsGuest = async (req, res) => {
  try {
    const response = await Room.find({}, "isEmpty roomNumber roomTag");
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
