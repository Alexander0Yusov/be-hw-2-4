import { body } from 'express-validator';

export const commentDtoValidationMiddleware = [
  body('content')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Контент обязательный')
    .isLength({ min: 20, max: 300 })
    .withMessage('Минимум 20, максимум 300 символов'),
];
