import { validationResult, ValidationError, FieldValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { HttpStatus } from '../../types/HttpStatus';

const formatErrors = (error: ValidationError) => {
  const expressError = error as unknown as FieldValidationError;

  return { field: expressError.path, message: expressError.msg };
};

export const errorsCatchMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req).formatWith(formatErrors).array({ onlyFirstError: true }); // value true is in my case

  if (errors.length) {
    return res.status(HttpStatus.BadRequest).json({ errorsMessages: errors });
  }

  next();
};
