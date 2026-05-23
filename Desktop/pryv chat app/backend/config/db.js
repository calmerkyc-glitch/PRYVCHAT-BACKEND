import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;
  const uriSource = process.env.MONGO_URI_DIRECT ? "MONGO_URI_DIRECT" : "MONGO_URI";

  if (!mongoUri) {
    console.error("MONGO_URI or MONGO_URI_DIRECT is not defined. Check your backend/.env file.");
    process.exit(1);
  }

  try {
    console.log(`Connecting to MongoDB using ${uriSource}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error(err);
    process.exit(1);
  }
};
