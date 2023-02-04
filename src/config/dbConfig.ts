import mongoose from "mongoose";

// Set up MongoDB connection
const mongoUrl = process.env.MONGO_URL;

async function connectToMongo() {
  try {
    console.log("Connecting to MongoDB...");
    if (!mongoUrl) {
      throw new Error("No MongoDB URL provided");
    }
    mongoose.set("strictQuery", true);
    mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
}

export default connectToMongo;
