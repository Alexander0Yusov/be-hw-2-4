import { Router } from 'express';
import { idValidationMiddleware } from '../../core/middlewares/validation/id-validation.middleware';
import { errorsCatchMiddleware } from '../../core/middlewares/validation/errors-catch.middleware';
import { deleteCommentHandler, getCommentHandler, putCommentHandler } from './handlers';
import { accessTokenGuard } from '../../5-auth/router/guards/access.token.guard';
import { commentDtoValidationMiddleware } from '../validation/comment-dto-validation.middleware';

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', idValidationMiddleware, errorsCatchMiddleware, getCommentHandler)

  .put(
    '/:id',
    accessTokenGuard,
    idValidationMiddleware,
    commentDtoValidationMiddleware,
    errorsCatchMiddleware,
    putCommentHandler,
  )

  .delete('/:id', accessTokenGuard, idValidationMiddleware, errorsCatchMiddleware, deleteCommentHandler);
