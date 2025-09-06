import { Router } from 'express';
import { errorsCatchMiddleware } from '../../core/middlewares/validation/errors-catch.middleware';
import { accessTokenGuard } from './guards/access.token.guard';
import {
  getAuthMeHandler,
  postAuthHandler,
  postAuthLogoutHandler,
  postAuthRefreshTokenHandler,
  postAuthRegistrationConfirmationHandler,
  postAuthRegistrationEmailResendingHandler,
  postAuthRegistrationHandler,
} from './handlers';
import { loginOrEmailDtoValidationMiddleware } from '../validation/login-or-email-dto-validation.middleware';
import { passwordDtoValidationMiddleware } from '../validation/password-dto-validation.middleware';
import { userDtoValidationMiddleware } from '../../4-users/validation/user-dto-validation.middleware';
import { confirmationCodeDtoValidationMiddleware } from '../validation/confirmation-code-dto-validation.middleware';
import { emailDtoValidationMiddleware } from '../validation/email-dto-validation.middleware';

export const authRouter = Router({});

authRouter.post(
  '/login',
  loginOrEmailDtoValidationMiddleware,
  passwordDtoValidationMiddleware,
  errorsCatchMiddleware,
  postAuthHandler,
);

authRouter.get('/me', accessTokenGuard, getAuthMeHandler);

authRouter.post('/registration', userDtoValidationMiddleware, errorsCatchMiddleware, postAuthRegistrationHandler);

authRouter.post(
  '/registration-confirmation',
  confirmationCodeDtoValidationMiddleware,
  errorsCatchMiddleware,
  postAuthRegistrationConfirmationHandler,
);

authRouter.post(
  '/registration-email-resending',
  emailDtoValidationMiddleware,
  errorsCatchMiddleware,
  postAuthRegistrationEmailResendingHandler,
);

authRouter.post('/refresh-token', postAuthRefreshTokenHandler);

authRouter.post('/logout', postAuthLogoutHandler);
