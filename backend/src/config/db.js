import mongoose from "mongoose";

const connectDatabase = async (mongoUri) => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected");
};

export default connectDatabase;
