import { Response, Request } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { authService } from '../../domain/auth.service';
import { RegistrationInputModel } from '../../types/registration-input-model';

import { createErrorMessages } from '../../../core/utils/error.utils';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';

export async function postAuthRegistrationHandler(req: Request<{}, {}, RegistrationInputModel>, res: Response) {
  const { login, email, password } = req.body;

  const newUser = await authService.registerUser(login, email, password);

  if (newUser.data) {
    res.sendStatus(resultCodeToHttpException(newUser.status));
    return;
  }

  res
    .status(resultCodeToHttpException(newUser.status))
    .send(
      createErrorMessages([
        { field: newUser?.extensions[0]?.field || '0', message: newUser?.extensions[0]?.message || '0' },
      ]),
    );
}
