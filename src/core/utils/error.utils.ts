import { ValidationError } from '../types/validationError';

export const createErrorMessages = (errors: ValidationError[]): { errorsMessages: ValidationError[] } => {
  return { errorsMessages: errors };
};
