import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../../adapters/jwt.service';
import { IdType } from '../../../core/types/id';

export const accessTokenGuard = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) return res.sendStatus(401);

  const [authType, token] = req.headers.authorization.split(' ');

  if (authType !== 'Bearer') return res.sendStatus(401);

  const payload = await jwtService.verifyAccessToken(token);

  if (payload) {
    const { userId } = payload;

    req.user = { id: userId } as IdType;
    next();

    return;
  }
  res.sendStatus(401);

  return;
};
