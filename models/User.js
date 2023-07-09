import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userStatus: {
      type: String,
      enum: ["admin", "member", "guest", "ex"],
      default: "guest",
      required: true,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    company: {
      type: String,
    },
    temporaryRoomId: {
      type: ObjectId,
      ref: "Room",
      default: "64916ce45d2dd8be66f35563",
    },
    roomId: {
      type: ObjectId,
      ref: "Room",
      default: null,
    },
    paymentId: [
      {
        type: ObjectId,
        ref: "PaymentHistory",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
