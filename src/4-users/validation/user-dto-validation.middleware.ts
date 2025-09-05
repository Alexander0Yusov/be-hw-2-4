import { body } from 'express-validator';

export const userDtoValidationMiddleware = [
  body('login')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Логин обязательно')
    .isLength({ min: 3, max: 10 })
    .withMessage('Минимум 3, максимум 10 символов')
    .matches('^[a-zA-Z0-9_-]*$')
    .withMessage('Невалидный формат'),

  body('email')
    .trim()
    .isString()
    .withMessage('Ожидается строка')
    .notEmpty()
    .withMessage('Имейл обязательный')
    .matches('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$')
    .withMessage('Невалидный формат'),

  body('password')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Пароль обязательный')
    .isLength({ min: 6, max: 20 })
    .withMessage('Минимум 6, максимум 20 символов'),
];
