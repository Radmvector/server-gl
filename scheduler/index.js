import moment from "moment-timezone";
import cron from "node-cron";
import Room from "../models/Room.js";
import User from "../models/User.js";

// ---------schedule untuk tiap satu menit------------
const scheduleTask = async () => {
  const currentTime = moment(); // Waktu lokal saat ini
  const gmtPlus7Time = currentTime.tz("Asia/Jakarta"); // Waktu GMT+7 saat ini

  // Menambahkan 1 hari pada tanggal gmtPlus7Time
  const nextDay = moment(gmtPlus7Time).add(1, "days").format("YYYY-MM-DD");

  const room = await Room.find({
    expiredDate: {
      $lte: nextDay, // Menggunakan nextDay sebagai batas tanggal expiredDate
    },
  });

  if (room.length > 0) {
    const expiredBooked = room?.filter((item) => {
      return item.isBooked === true;
    });

    const expiredPayment = room?.filter((item) => {
      return item.isBooked === false;
    });

    // console.log({
    //   before: {
    //     expiredBooked,
    //     expiredPayment,
    //   },
    // });

    if (expiredBooked.length > 0) {
      expiredBooked.map(async (item) => {
        // untuk user
        item.userId?.map(async (users) => {
          const user = await User.findById(users._id);
          // console.log({
          //   before: user,
          // });
          user.roomId = null;
          user.userStatus = "guest";
          try {
            await user.save();

            // console.log({ user });
          } catch (error) {
            console.log(error);
          }
        });

        // untuk room
        item.price = 500_000;
        item.userId = null;
        item.isEmpty = true;
        item.isPaid = false;
        item.expiredDate = null;
        item.isBooked = false;
        item.checkInDate = null;
        try {
          await item.save();

          // console.log({ item });
        } catch (error) {
          console.log(error);
        }
      });
    } else {
      console.log("Tidak ada pembayaran yang expired");
    }

    if (expiredPayment.length > 0) {
      expiredPayment.map(async (item) => {
        item.isPaid = false;
      });
    } else {
      console.log("Tidak ada ruangan yang expired");
    }
  } else {
    console.log("Tidak ada ruangan yang expired");
  }
};

cron.schedule("59 6 * * *", scheduleTask);
