import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    // Attempt standard connection to specified URI (Local MongoDB or Atlas)
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Standard MongoDB connection failed (${error.message}).`);
    console.log('🚀 Initializing zero-configuration MongoDB Memory Server fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB Memory Server running at: ${uri}`);
      return conn;
    } catch (memErr) {
      console.error(`❌ Failed to start MongoDB Memory Server: ${memErr.message}`);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
