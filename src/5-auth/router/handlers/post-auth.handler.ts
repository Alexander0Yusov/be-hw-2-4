import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { AuthInputModel } from '../../types/auth-iput-model';
import { authService } from '../../domain/auth.service';
import { ResultStatus } from '../../../core/result/resultCode';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';

export async function postAuthHandler(req: Request<{}, {}, AuthInputModel>, res: Response) {
  const { loginOrEmail, password } = req.body;

  const result = await authService.loginUser(loginOrEmail, password);

  if (result.status !== ResultStatus.Success) {
    return res.status(resultCodeToHttpException(result.status)).send(result.extensions);
  }

  return res.status(HttpStatus.Ok).send({ accessToken: result.data!.accessToken });
}
