import dotenv from 'dotenv';

dotenv.config();

export const SETTINGS = {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL as string,
  DB_NAME: process.env.DB_NAME as string,
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: process.env.AC_TIME as string,

  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
};
