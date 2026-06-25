import mongoose, { Schema } from "mongoose";

const messageschema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'chat'
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  file :{
    type : String,
    required : false
  }
},
{ timestamps: true }
)
const messagemodel = mongoose.model("message",messageschema)
 export  default messagemodel ;









