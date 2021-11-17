import mongoose from "mongoose";

export async function MongooseService() {
  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    useFindAndModify: false,
  };
  const connect = await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/testing",
    mongooseOptions
  );

  if (connect) {
    console.log("MongoDB is connected");
  } else {
    throw new Error("Cannot connect to DB");
  }
}
