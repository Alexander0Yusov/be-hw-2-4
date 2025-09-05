import { Request, Response, Router } from 'express';

import { superAdminGuardMiddleware } from '../../core/middlewares/validation/super-admin-guard.middleware';
import { errorsCatchMiddleware } from '../../core/middlewares/validation/errors-catch.middleware';
import { postUserHandler } from './handlers/post-user.handler';
import { userDtoValidationMiddleware } from '../validation/user-dto-validation.middleware';
import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation-middleware';
import { UserSortField } from './input/user-sort-field';
import { getUserListHandler } from './handlers/get-user-list.handler';
import { idValidationMiddleware } from '../../core/middlewares/validation/id-validation.middleware';
import { deleteUserHandler } from './handlers/delete-user.handler';
import { query } from 'express-validator';

export const usersRouter = Router({});

usersRouter.get(
  '',
  paginationAndSortingValidation(UserSortField),
  query('searchLoginTerm').optional().trim(),
  query('searchEmailTerm').optional().trim(),
  getUserListHandler,
);

usersRouter.post(
  '',
  superAdminGuardMiddleware,
  userDtoValidationMiddleware,
  errorsCatchMiddleware,
  postUserHandler,
);

usersRouter.delete(
  '/:id',
  superAdminGuardMiddleware,
  idValidationMiddleware,
  errorsCatchMiddleware,
  deleteUserHandler,
);
