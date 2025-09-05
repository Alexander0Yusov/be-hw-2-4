import { Router } from 'express';
import { errorsCatchMiddleware } from '../../core/middlewares/validation/errors-catch.middleware';
import { accessTokenGuard } from './guards/access.token.guard';
import {
  getAuthMeHandler,
  postAuthHandler,
  postAuthRegistrationConfirmationHandler,
  postAuthRegistrationHandler,
} from './handlers';
import { loginOrEmailDtoValidationMiddleware } from '../validation/login-or-email-dto-validation.middleware';
import { passwordDtoValidationMiddleware } from '../validation/password-dto-validation.middleware';
import { userDtoValidationMiddleware } from '../../4-users/validation/user-dto-validation.middleware';
import { confirmationCodeDtoValidationMiddleware } from '../validation/confirmation-code-dto-validation.middleware';
import { emailDtoValidationMiddleware } from '../validation/email-dto-validation.middleware';
import { postAuthRegistrationEmailResendingHandler } from './handlers/post-auth-registration-email-resending.handler';

export const authRouter = Router({});

authRouter.post(
  '/login',
  loginOrEmailDtoValidationMiddleware,
  passwordDtoValidationMiddleware,
  errorsCatchMiddleware,
  postAuthHandler,
);

authRouter.get('/me', accessTokenGuard, getAuthMeHandler);

//
authRouter.post('/registration', userDtoValidationMiddleware, errorsCatchMiddleware, postAuthRegistrationHandler);

authRouter.post(
  '/registration-confirmation',
  confirmationCodeDtoValidationMiddleware,
  errorsCatchMiddleware,
  postAuthRegistrationConfirmationHandler,
);

// должен существовать имейл, чтобы снова создать код и снова его отправить на почту
authRouter.post(
  '/registration-email-resending',
  emailDtoValidationMiddleware,
  errorsCatchMiddleware,
  postAuthRegistrationEmailResendingHandler,
);
