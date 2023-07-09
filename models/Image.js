import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const imageSchema = new mongoose.Schema({
  imgUrl: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Image", imageSchema);
