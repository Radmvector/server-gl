import BookingPayment from "../models/BookingPayment.js";
import Maintenances from "../models/Maintenance.js";
import Payments from "../models/PaymentHistory.js";

export const getFinancials = async (req, res) => {
  const maintenances = await Maintenances.find(
    {},
    "mtName mtCost mtDate mtType"
  );
  const payments = await Payments.find(
    { status: "accept" },
    "price createdAt roomName"
  );

  const bookingPayments = await BookingPayment.find(
    { status: "accept" },
    "price createdAt roomName"
  );

  //   menghitung total booking payment
  const bookingPaymentCostList = bookingPayments.map((bookingPayment) => {
    return bookingPayment.price;
  });
  const totalBookingPaymentCost = bookingPaymentCostList.reduce(
    (a, b) => a + b,
    0
  );

  //   menghitung total maintenance
  const maintenanceCostList = maintenances.map((maintenance) => {
    return maintenance.mtCost;
  });
  const totalMaintenanceCost = maintenanceCostList.reduce((a, b) => a + b, 0);

  //   menghitung total pembayaran
  const paymentCostList = payments.map((payment) => {
    return payment.price;
  });
  const totalPaymentCost = paymentCostList.reduce((a, b) => a + b, 0);

  // menghitung total pendapatan
  const balance =
    totalPaymentCost + totalBookingPaymentCost - totalMaintenanceCost;

  try {
    res.status(200).json({
      income: totalPaymentCost + totalBookingPaymentCost,
      outcome: totalMaintenanceCost,
      balance,
      totalBookingPaymentCost,
      totalPaymentCost,
      totaldDataPayment: payments.length,
      paymentData: payments,
      totalDataMaintenance: maintenances.length,
      maintenanceData: maintenances,
      totalDataBookingPayment: bookingPayments.length,
      bookingPaymentData: bookingPayments,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getTodayFinancials = async (req, res) => {
  // membuat tanggal hari ini
  const paymentDayDate = new Date();
  paymentDayDate.setDate(paymentDayDate.getDate() + 1);
  const paymentDay = paymentDayDate.toLocaleString().split(",")[0];
  const today = new Date();
  const todayDate = today.toLocaleString().split(",")[0];

  // mengambil pembayaran yang statusnya accept dan tanggalnya hari ini
  const payments = await Payments.find({
    status: "accept",
  });

  const todayPayments = payments.filter((payment) => {
    const paymentDate = payment.createdAt.toLocaleString().split(",")[0];
    return paymentDate === todayDate;
  });

  // menghitung total pembayaran
  const paymentCostList = todayPayments.map((payment) => {
    return payment.price;
  });
  const totalPaymentCost = paymentCostList.reduce((a, b) => a + b, 0);

  // mengambil maintenance yang tanggalnya hari ini
  const maintenances = await Maintenances.find();
  const todayMaintenances = maintenances.filter((maintenance) => {
    const maintenanceDate = maintenance.mtDate.toLocaleString().split(",")[0];
    return maintenanceDate === paymentDay;
  });

  // menghitung total maintenance
  const maintenanceCostList = todayMaintenances.map((maintenance) => {
    return maintenance.mtCost;
  });
  const totalMaintenanceCost = maintenanceCostList.reduce((a, b) => a + b, 0);

  // menghitung total pendapatan
  const balance = totalPaymentCost - totalMaintenanceCost;

  try {
    res.status(200).json({
      date: todayDate,
      income: totalPaymentCost,
      outcome: totalMaintenanceCost,
      balance,
      totaldDataPayment: todayPayments.length,
      paymentData: todayPayments,
      totalDataMaintenance: todayMaintenances.length,
      maintenanceData: todayMaintenances,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getWeekFinancials = async (req, res) => {
  // mengambil tanggal minggu ini
  const today = new Date();
  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay()
  );

  const endOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + (6 - today.getDay())
  );

  // mengambil pembayaran yang statusnya accept dan tanggalnya minggu ini
  const payments = await Payments.find({
    status: "accept",
    createdAt: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  });

  // menghitung total pembayaran
  const paymentCostList = payments.map((payment) => {
    return payment.price;
  });
  const totalPaymentCost = paymentCostList.reduce((a, b) => a + b, 0);

  // mengambil maintenance yang tanggalnya minggu ini
  const maintenances = await Maintenances.find({
    mtDate: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  });

  // menghitung total maintenance
  const maintenanceCostList = maintenances.map((maintenance) => {
    return maintenance.mtCost;
  });
  const totalMaintenanceCost = maintenanceCostList.reduce((a, b) => a + b, 0);

  // menghitung total pendapatan
  const balance = totalPaymentCost - totalMaintenanceCost;

  try {
    res.status(200).json({
      date: {
        start: startOfWeek,
        end: endOfWeek,
      },
      income: totalPaymentCost,
      outcome: totalMaintenanceCost,
      balance,
      totaldDataPayment: payments.length,
      paymentData: payments,
      totalDataMaintenance: maintenances.length,
      maintenanceData: maintenances,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getLastWeekFinancials = async (req, res) => {
  // mendapatkan tanggal hari ini
  const today = new Date();

  // mendapatkan tanggal minggu lalu
  const startOfLastWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() - 7
  );

  const endOfLastWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() - 1
  );

  // mengambil pembayaran yang statusnya accept dan tanggalnya minggu lalu
  const payments = await Payments.find({
    status: "accept",
    createdAt: {
      $gte: startOfLastWeek,
      $lte: endOfLastWeek,
    },
  });

  // menghitung total pembayaran
  const paymentCostList = payments.map((payment) => {
    return payment.price;
  });
  const totalPaymentCost = paymentCostList.reduce((a, b) => a + b, 0);

  // mengambil maintenance yang tanggalnya minggu lalu
  const maintenances = await Maintenances.find({
    mtDate: {
      $gte: startOfLastWeek,
      $lte: endOfLastWeek,
    },
  });

  // menghitung total maintenance
  const maintenanceCostList = maintenances.map((maintenance) => {
    return maintenance.mtCost;
  });
  const totalMaintenanceCost = maintenanceCostList.reduce((a, b) => a + b, 0);

  // menghitung total pendapatan
  const balance = totalPaymentCost - totalMaintenanceCost;

  try {
    res.status(200).json({
      date: {
        start: startOfLastWeek,
        end: endOfLastWeek,
      },
      income: totalPaymentCost,
      outcome: totalMaintenanceCost,
      balance,
      totaldDataPayment: payments.length,
      paymentData: payments,
      totalDataMaintenance: maintenances.length,
      maintenanceData: maintenances,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getMonthFinancials = async (req, res) => {
  // mengambil tanggal bulan ini
  const startDate = new Date();
  startDate.setDate(2);
  startDate.setHours(0, 0, 0, 0);

  // mengambil tanggal akhir bulan ini
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  // mendapatkan data bulan ini
  const getMonth = startDate.toLocaleString("default", { month: "long" });

  // mengambil pembayaran yang statusnya accept dan tanggalnya bulan ini
  const payments = await Payments.find({
    status: "accept",
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  // menghitung total pembayaran
  const paymentCostList = payments.map((payment) => {
    return payment.price;
  });
  const totalPaymentCost = paymentCostList.reduce((a, b) => a + b, 0);

  // mengambil maintenance yang tanggalnya bulan ini
  const maintenances = await Maintenances.find({
    mtDate: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  // menghitung total maintenance
  const maintenanceCostList = maintenances.map((maintenance) => {
    return maintenance.mtCost;
  });
  const totalMaintenanceCost = maintenanceCostList.reduce((a, b) => a + b, 0);

  // menghitung total pendapatan
  const balance = totalPaymentCost - totalMaintenanceCost;

  try {
    res.status(200).json({
      date: {
        start: startDate,
        end: endDate,
      },
      month: getMonth,
      income: totalPaymentCost,
      outcome: totalMaintenanceCost,
      balance,
      totaldDataPayment: payments.length,
      paymentData: payments,
      totalDataMaintenance: maintenances.length,
      maintenanceData: maintenances,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCustomDateFinancials = async (req, res) => {
  // mengambil input data tanggal
  const { date } = req.body;

  const splittingDate = date.split("-");

  const splitYear = parseInt(splittingDate[0]);
  const splitMonth = parseInt(splittingDate[1]) - 1;
  const splitDate = parseInt(splittingDate[2]) + 1;

  const today = new Date(splitYear, splitMonth, splitDate);
  const todayDate = today.toLocaleString().split(",")[0];

  //   mencari data pembayaran dengan tanggal yang diinput
  const allPayments = await Payments.find({
    status: "accept",
  });
  const payments = allPayments.filter((payment) => {
    const paymentDate = payment.createdAt.toLocaleString().split(",")[0];
    return paymentDate === todayDate;
  });
  const paymentCostList = payments.map((payment) => {
    return payment.price;
  });
  const totalPaymentCost = paymentCostList.reduce((a, b) => a + b, 0);

  //   mencari data maintenance dengan tanggal yang diinput
  const allMaintenances = await Maintenances.find();
  const maintenances = allMaintenances.filter((maintenance) => {
    const maintenanceDate = maintenance.mtDate.toLocaleString().split(",")[0];
    return maintenanceDate === todayDate;
  });
  const maintenanceCostList = maintenances.map((maintenance) => {
    return maintenance.mtCost;
  });
  const totalMaintenanceCost = maintenanceCostList.reduce((a, b) => a + b, 0);

  // menghitung total pendapatan
  const balance = totalPaymentCost - totalMaintenanceCost;

  try {
    res.status(200).json({
      date: today,
      income: totalPaymentCost,
      outcome: totalMaintenanceCost,
      balance,
      totaldDataPayment: payments.length,
      paymentData: payments,
      totalDataMaintenance: maintenances.length,
      maintenanceData: maintenances,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getFinancialsByMonthAndYear = async (req, res) => {
  const { month, year } = req.params;

  const payments = await Payments.find({
    // ,1 menunjukkan tanggal pada bulan dimulai dengan 1
    createdAt: {
      // index dimulai dari 0
      $gte: new Date(year, month - 1, 1), // tanggal 1 bulan yang dimaksud
      $lt: new Date(year, month, 1), // tanggal 1 bulan berikutnya
    },
  });
  const paymentCostList = payments.map((payment) => {
    return payment.price;
  });
  const totalPaymentCost = paymentCostList.reduce((a, b) => a + b, 0);

  const maintenances = await Maintenances.find({
    mtDate: {
      $gte: new Date(year, month - 1, 1),
      $lt: new Date(year, month, 1),
    },
  });
  const maintenanceCostList = maintenances.map((maintenance) => {
    return maintenance.mtCost;
  });
  const totalMaintenanceCost = maintenanceCostList.reduce((a, b) => a + b, 0);

  const bookingPayments = await BookingPayment.find({
    createdAt: {
      $gte: new Date(year, month - 1, 1),
      $lt: new Date(year, month, 1),
    },
  });
  const bookingPaymentCostList = bookingPayments.map((bookingPayment) => {
    return bookingPayment.price;
  });
  const totalBookingPaymentCost = bookingPaymentCostList.reduce(
    (a, b) => a + b,
    0
  );

  const balance =
    totalPaymentCost + totalBookingPaymentCost - totalMaintenanceCost;

  try {
    res.status(200).json({
      income: totalPaymentCost + totalBookingPaymentCost,
      outcome: totalMaintenanceCost,
      balance,
      totalBookingPaymentCost,
      totalPaymentCost,
      totalMaintenanceCost,
      totaldDataPayment: payments.length,
      paymentData: payments,
      totalDataMaintenance: maintenances.length,
      maintenanceData: maintenances,
      totalDataBookingPayment: bookingPayments.length,
      bookingPaymentData: bookingPayments,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
