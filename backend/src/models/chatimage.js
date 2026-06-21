import mongoose from "mongoose";

const chatImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  fileId: {
    type: String,
    required: true
  },
  fileTitle: {
    type: String,
    required: true
  }
});

const chatImageModel = mongoose.model("ChatImage", chatImageSchema);
export default chatImageModel;  








