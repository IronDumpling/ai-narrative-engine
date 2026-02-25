import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/narrative_weaver",
};

