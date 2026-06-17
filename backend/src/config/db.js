import mongoose from "mongoose";

function connectDatabase(){
mongoose.connect(process.env.MONGODB_URI)
.then=()=>{
console.log("db connect")
}

}

export default connectDatabase;
