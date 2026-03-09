import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  port: parseInt(process.env.PORT || "4000", 10),
};

