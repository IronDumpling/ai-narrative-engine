import mongoose from "mongoose";
import { ENV } from "./env";

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(ENV.mongoUri, {
    autoIndex: true,
  });
}

