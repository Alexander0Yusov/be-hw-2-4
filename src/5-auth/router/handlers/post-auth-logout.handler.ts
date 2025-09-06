import { Response } from 'express';
import { IdType } from '../../../core/types/id';
import { RequestWithUserId } from '../../../core/types/requests';
import { authService } from '../../domain/auth.service';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';

export async function postAuthLogoutHandler(req: RequestWithUserId<IdType>, res: Response) {
  const incomeRefreshToken = req.cookies.refreshToken;

  const result = await authService.logoutUser(incomeRefreshToken);

  if (result.status !== ResultStatus.NoContent) {
    return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
  }

  res.cookie('refreshToken', '', { httpOnly: true, secure: true, expires: new Date(0) });

  res.sendStatus(resultCodeToHttpException(result.status));
}
