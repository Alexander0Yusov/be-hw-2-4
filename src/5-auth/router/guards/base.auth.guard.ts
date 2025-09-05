import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';

dotenv.config(); // взять переменные из окружения

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qwerty';

export const ADMIN_TOKEN = 'Basic ' + Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');

export const baseAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization !== ADMIN_TOKEN) return res.sendStatus(401);

  return next();
};
