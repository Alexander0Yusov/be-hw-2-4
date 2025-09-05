import { body } from 'express-validator';

export const blogDtoValidationMiddleware = [
  body('name')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Имя обязательно')
    .isLength({ max: 15 })
    .withMessage('Максимум 15 символов'),
  body('description')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Описание обязательно')
    .isLength({ max: 500 })
    .withMessage('Максимум 500 символов'),
  body('websiteUrl')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Адрес обязательный')
    .isLength({ max: 100 })
    .withMessage('Максимум 100 символов')
    .matches(
      '^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$',
    )
    .withMessage('Невалидный формат'),
];
