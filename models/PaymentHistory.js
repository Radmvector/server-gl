import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const paymentHistorySchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accept", "reject"],
      default: "pending",
    },
    imgUrl: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    roomName: {
      type: String,
      required: true,
    },
    isFromAdmin: {
      type: Boolean,
      default: false,
    },
    roomId: {
      type: ObjectId,
      ref: "Room",
      required: true,
    },
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentHistory", paymentHistorySchema);
