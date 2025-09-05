import { body } from 'express-validator';

export const confirmationCodeDtoValidationMiddleware = body('code')
  .isString()
  .withMessage('Ожидается строка')
  .trim()
  .notEmpty()
  .withMessage('Код подтверждения обязательный');
