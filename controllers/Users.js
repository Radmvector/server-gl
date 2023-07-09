import argon2 from "argon2";
import Rooms from "../models/Room.js";
import Users from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const response = await Users.find(
      {},
      "name email userStatus address phone company roomId createdAt"
    ).populate({
      path: "roomId",
      select: "roomNumber roomTag",
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  const user = await Users.findById(id);
  // console.log({ id, user });
  try {
    res.status(200).json({ message: "User found", datas: user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    confPassword,
    userStatus,
    address,
    phone,
    company,
    roomId,
  } = req.body;

  if (password != confPassword) {
    res.status(500).json({ message: "Password not match" });
  } else {
    const hashPassword = await argon2.hash(password);
    try {
      await Users.create({
        name,
        email,
        password: hashPassword,
        userStatus: "admin",
        address,
        phone,
        company,
        roomId,
      });
      res.status(200).json({ message: "User created" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const user = await Users.findOne({ _id: id });

  console.log(user);

  if (!user) {
    res.status(404).json({ message: "User not found" });
  } else {
    const { name, password, confPassword, address, phone, company, roomId } =
      req.body;
    const lastRoomId = user.roomId;
    let hashPassword;
    if (password === "" || password === null) {
      hashPassword = user.password;
    } else {
      hashPassword = await argon2.hash(password);
    }
    if (password != confPassword) {
      res.status(500).json({ message: "Password not match" });
    } else {
      try {
        user.name = name;
        user.password = hashPassword;
        user.address = address;
        user.phone = phone;
        user.company = company;

        // add roomId to user
        if (roomId && !lastRoomId) {
          const findRoom = await Rooms.findOne({ _id: roomId });
          // jika room available
          if (findRoom.isEmpty === true) {
            console.log({ empty: findRoom.isEmpty });

            // memasukkan userId ke dokumen rooms
            findRoom.userId.push({ _id: id });
            findRoom.isEmpty = false;
            await findRoom.save();

            // memasukkan roomId ke dokumen users
            console.log({ finded: findRoom._id });
            user.roomId = findRoom._id;
            user.userStatus = "member";
            console.log("berhasil", { user, findRoom });
            await user.save();

            // messages
            res.status(200).json({ message: "User updated" });
          }

          // jika room tidak available
          else {
            res.status(500).json({ message: "Room not available" });
          }
        }

        // change roomId
        else if (lastRoomId && roomId) {
          if (roomId != lastRoomId) {
            const lastRoom = await Rooms.findOne({ _id: lastRoomId });
            const newRoom = await Rooms.findOne({ _id: roomId });

            // jika room available
            if (newRoom.isEmpty === true) {
              console.log({ empty: newRoom.isEmpty });

              // memasukkan userId ke dokumen rooms baru
              newRoom.userId.push({ _id: id });
              newRoom.isEmpty = false;
              await newRoom.save();

              // menghapus userId dari dokumen rooms lama
              lastRoom.userId.pull({ _id: id });
              lastRoom.isEmpty = true;
              await lastRoom.save();

              // memasukkan roomId baru ke dokumen users
              console.log({ finded: newRoom._id });
              user.roomId = newRoom._id;
              console.log("berhasil", { user, newRoom });
              await user.save();

              // messages
              res.status(200).json({ message: "User updated" });
            }

            // jika room tidak available
            else {
              // messages
              res.status(500).json({ message: "Room not available" });
            }
          } else {
            // messages
            res
              .status(200)
              .json({ message: "User updated | without changing room" });
          }
        }

        // remove roomId
        else if (lastRoomId && roomId === "") {
          const findRoom = await Rooms.findOne({ _id: lastRoomId });

          // menghapus userId dari dokumen rooms
          findRoom.userId.pull({ _id: id });
          findRoom.isEmpty = true;
          await findRoom.save();

          // menghapus roomId dari dokumen users
          user.roomId = null;
          user.userStatus = "ex";
          console.log("berhasil", { findRoom, user });
          await user.save();

          // message
          res.status(200).json({ message: "User updated" });
        }

        // jika room tidak available
        else {
          await user.save();
          res
            .status(200)
            .json({ message: "User updated | without changing room" });
        }
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await Users.findOne({ _id: id });
  if (!user) {
    res.status(404).json({ message: "User not found" });
  } else {
    const lastRoomId = user.roomId;

    try {
      // menghapus userId dari dokumen rooms
      if (lastRoomId !== null) {
        const findRoom = await Rooms.findOne({ _id: lastRoomId });
        findRoom.userId.pull({ _id: id });
        findRoom.isEmpty = true;
        await findRoom.save();
      }

      await Users.deleteOne({ _id: id });
      res.status(200).json({ message: "User deleted" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// user client
// ##########################################
export const createUserClient = async (req, res) => {
  const {
    name,
    email,
    password,
    confPassword,
    address,
    phone,
    company,
    temporaryRoomId,
  } = req.body;

  const userByEmail = await Users.findOne({ email });

  if (userByEmail) {
    res.status(500).json({ message: "Email sudah digunakan" });
  } else {
    if (password != confPassword) {
      res.status(500).json({ message: "Password tidak sama" });
    } else {
      const hashPassword = await argon2.hash(password);
      try {
        await Users.create({
          name,
          email,
          password: hashPassword,
          address,
          phone,
          company,
          temporaryRoomId,
        });
        res.status(201).json({ message: "User berhasil dibuat" });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
};

export const updateUserClient = async (req, res) => {
  const { id } = req.params;

  const user = await Users.findOne({ _id: id });

  if (!user) {
    res.status(404).json({ message: "Data user tidak ditemukan" });
  } else {
    const { name, password, confPassword, address, phone, company } = req.body;
    let hashPassword;
    if (password === "" || password === null) {
      hashPassword = user.password;
    } else {
      hashPassword = await argon2.hash(password);
    }
    if (password != confPassword) {
      res.status(500).json({ message: "Password tidak sama" });
    } else {
      try {
        await Users.findOneAndUpdate(
          { _id: id },
          {
            name: name,
            password: hashPassword,
            address: address,
            phone: phone,
            company: company,
          }
        );
        res.status(200).json({ message: "data berhasil diperbarui" });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
};

export const updateTemporaryRoomId = async (req, res) => {
  const { userId } = req.session;

  const newTemporaryRoomId = req.body.temporaryRoomId;
  const user = await Users.findOne({ _id: userId });
  if (!user) {
    res.status(404).json({ message: "User not found" });
  } else {
    try {
      await Users.findByIdAndUpdate(
        { _id: userId },
        {
          temporaryRoomId: newTemporaryRoomId,
        }
      );
      res.status(200).json({ message: "User updated" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
