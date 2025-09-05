import { body } from 'express-validator';

export const postDtoByBlogIdValidationMiddleware = [
  body('title')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Имя обязательно')
    .isLength({ max: 30 })
    .withMessage('Максимум 30 символов'),
  body('shortDescription')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Описание обязательно')
    .isLength({ max: 100 })
    .withMessage('Максимум 100 символов'),
  body('content')
    .isString()
    .withMessage('Ожидается строка')
    .trim()
    .notEmpty()
    .withMessage('Контент обязательный')
    .isLength({ max: 1000 })
    .withMessage('Максимум 1000 символов'),
];
