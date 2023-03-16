import mongoose from "mongoose";
import env from "../env";

/*
 * Setup MongoDB connection
 * Mongoose is used to connect to MongoDB
 * StrictQuery is set to true to ensure that the client and server
 * are using the same schema and only allow queries that match the schema
 */

async function connectToMongo() {
  const mongoUrl = env.MONGO_URL;
  try {
    console.log("Connecting to MongoDB...");
    mongoose.set("strictQuery", true);
    mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export default connectToMongo;
