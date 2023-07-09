import User from "../models/User.js";

export const verifyUser = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      message: "Silakan login terlebih dahulu",
    });
  }

  const user = await User.findOne({
    _id: req.session.userId,
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  req.userId = user._id;
  req.userStatus = user.userStatus;
  next();
};

export const adminOnly = async (req, res, next) => {
  const user = await User.findOne({
    _id: req.session.userId,
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (user.userStatus !== "admin") {
    return res.status(403).json({
      message: "Admin only",
    });
  }

  next();
};

export const memberOnly = async (req, res, next) => {
  const user = await User.findOne({
    _id: req.session.userId,
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (user.userStatus !== "member") {
    return res.status(403).json({
      message: "Member only",
    });
  }

  next();
};
