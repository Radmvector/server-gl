import Maintenances from "../models/Maintenance.js";

export const getMaintenances = async (req, res) => {
  try {
    const maintenances = await Maintenances.find();
    res.status(200).json({
      dataLength: maintenances.length,
      datas: maintenances,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getMaintenance = async (req, res) => {
  const { id } = req.params;

  try {
    const maintenance = await Maintenances.findById(id);
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createMaintenance = async (req, res) => {
  const { mtName, mtType, mtCost } = req.body;
  let { mtDate } = req.body;

  if (!mtDate || mtDate === "") {
    mtDate = new Date();
  } else {
    const splitDate = new Date(mtDate);

    const getDateSplitted = splitDate.getDate() + 1;
    const getMonthSplitted = splitDate.getMonth();
    const getYearSplitted = splitDate.getFullYear();

    mtDate = new Date(getYearSplitted, getMonthSplitted, getDateSplitted);
  }

  const newMaintenance = new Maintenances({
    mtName,
    mtType,
    mtCost,
    mtDate,
  });

  try {
    await newMaintenance.save();
    // console.log({ newMaintenance });
    res.status(201).json({ message: "Berhasil menambah Pengeluaran" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateMaintenance = async (req, res) => {
  const { id } = req.params;
  const { mtName, mtType, mtCost } = req.body;
  let { mtDate } = req.body;

  const splitDate = new Date(mtDate);

  const getDateSplitted = splitDate.getDate() + 1;
  const getMonthSplitted = splitDate.getMonth();
  const getYearSplitted = splitDate.getFullYear();

  mtDate = new Date(getYearSplitted, getMonthSplitted, getDateSplitted);

  const maintenance = await Maintenances.findById(id);

  if (!maintenance) {
    res.status(404).send(`Data pengeluaran dengan id ${id} tidak ditemukan.`);
  } else {
    try {
      await Maintenances.findByIdAndUpdate(id, {
        mtName,
        mtType,
        mtCost,
        mtDate,
      });
      res.status(200).json({ message: "Berhasil memperbarui data." });
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }
};

export const deleteMaintenance = async (req, res) => {
  const { id } = req.params;

  const maintenanceLength = await Maintenances.find().countDocuments();
  console.log({ before: maintenanceLength });

  const maintenanceExists = await Maintenances.findByIdAndRemove(id);

  if (!maintenanceExists)
    return res
      .status(404)
      .send(`Data pengeluaran dengan id ${id} tidak ditemukan.`);

  res.status(200).json({ message: "Berhasil menghapus data." });
};
