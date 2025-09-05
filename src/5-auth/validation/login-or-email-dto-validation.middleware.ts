import { body } from 'express-validator';

export const loginOrEmailDtoValidationMiddleware = body('loginOrEmail')
  .isString()
  .withMessage('Ожидается строка')
  .trim()
  .notEmpty()
  .withMessage('Логин или имейл обязательный');
