import mongoose from "mongoose";

const today = new Date();

const maintenanceSchema = new mongoose.Schema(
  {
    mtName: {
      type: String,
      required: true,
    },
    mtType: {
      type: String,
      enum: ["repair", "newBuy"],
      required: true,
    },
    mtCost: {
      type: Number,
      required: true,
    },
    mtDate: {
      type: Date,
      required: true,
      default: today,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Maintenance", maintenanceSchema);
