import { Response, Request } from 'express';
import { authService } from '../../domain/auth.service';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { resultCodeToHttpException } from '../../../core/result/resultCodeToHttpException';

export async function postAuthRegistrationEmailResendingHandler(
  req: Request<{}, {}, { email: string }>,
  res: Response,
) {
  const { email } = req.body;

  const result = await authService.resendConfirmationCode(email);

  if (result.data) {
    res.sendStatus(resultCodeToHttpException(result.status));
    return;
  }

  res
    .status(resultCodeToHttpException(result.status))
    .send(createErrorMessages([{ field: 'email', message: result.extensions[0]?.message }]));
}
