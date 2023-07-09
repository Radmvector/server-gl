import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: Number,
    required: true,
  },
  roomTag: {
    type: String,
    required: true,
  },
  isEmpty: {
    type: Boolean,
    default: true,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
    required: true,
  },
  price: {
    type: Number,
    default: 500_000,
    required: true,
  },
  checkInDate: {
    type: Date,
  },
  isBooked: {
    type: Boolean,
    default: false,
    required: true,
  },
  expiredDate: {
    type: Date,
  },
  userId: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  imageId: [
    {
      type: ObjectId,
      ref: "Image",
    },
  ],
});

export default mongoose.model("Room", roomSchema);
