import mongoose from "mongoose";
import env from "../env";

// Set up MongoDB connection
const mongoUrl = env.MONGO_URL;

async function connectToMongo() {
  try {
    console.log("Connecting to MongoDB...");
    mongoose.set("strictQuery", true);
    mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
}

export default connectToMongo;
