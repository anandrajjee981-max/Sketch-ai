import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
  
    user: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  
  },
  {
    timestamps: true,
  }
);

const chatmodel = mongoose.model("chat", chatSchema);
export default chatmodel;
