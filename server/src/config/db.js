import mongoose from 'mongoose';
import pkg from 'mongodb-memory-server';
const { MongoMemoryServer } = pkg;

let mongoServer;

const connectDB = async () => {
  try {
    // Try to connect to normal MongoDB first
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000 // Short timeout to quickly fallback
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.log('Local MongoDB not found. Falling back to in-memory MongoDB...');
    try {
      // Start in-memory MongoDB
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${mongoUri}`);
    } catch (memError) {
      console.error(`Error connecting to In-Memory MongoDB: ${memError.message}`);
    }
  }
};

export default connectDB;
