import { Response, Request } from 'express';
import { authService } from '../../domain/auth.service';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';

export async function postAuthRegistrationConfirmationHandler(req: Request<{}, {}, { code: string }>, res: Response) {
  const { code } = req.body;

  const result = await authService.confirmEmail(code);

  if (result.data) {
    res.sendStatus(resultCodeToHttpException(result.status));
    return;
  }

  res
    .status(resultCodeToHttpException(result.status))
    .send(createErrorMessages([{ field: 'code', message: result.extensions[0]?.message }]));
}
