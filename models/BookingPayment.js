import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const bookingSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
    },
    roomId: {
      type: ObjectId,
      ref: "Room",
      required: true,
    },
    userId: {
      type: ObjectId,
      ref: "User",
    },
    imgUrl: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "accept", "reject"],
      required: true,
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
      default: 100_000,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Booking", bookingSchema);
