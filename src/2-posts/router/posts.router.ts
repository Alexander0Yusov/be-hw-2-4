import { Router } from 'express';
import { idValidationMiddleware } from '../../core/middlewares/validation/id-validation.middleware';
import { errorsCatchMiddleware } from '../../core/middlewares/validation/errors-catch.middleware';
import { superAdminGuardMiddleware } from '../../core/middlewares/validation/super-admin-guard.middleware';
import { postDtoValidationMiddleware } from '../validation/post-dto-validation.middleware';
import { deletePostHandler, getPostHandler, getPostListHandler, postPostHandler, putPostHandler } from './handlers';
import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation-middleware';
import { PostSortField } from './input/post-sort-field';
import { commentDtoValidationMiddleware } from '../../6-comments/validation/comment-dto-validation.middleware';
import { postCommentHandler } from './handlers/post-comment.handler';
import { accessTokenGuard } from '../../5-auth/router/guards/access.token.guard';
import { CommentSortField } from './input/comment-sort-field';
import { getCommentListHandler } from './handlers/get-comment-list.handler';

export const postsRouter = Router({});

postsRouter
  .get('', paginationAndSortingValidation(PostSortField), getPostListHandler)

  .get('/:id/comments', paginationAndSortingValidation(CommentSortField), getCommentListHandler)

  .post('', superAdminGuardMiddleware, postDtoValidationMiddleware, errorsCatchMiddleware, postPostHandler)

  .post(
    '/:id/comments',
    accessTokenGuard,
    idValidationMiddleware,
    commentDtoValidationMiddleware,
    errorsCatchMiddleware,
    postCommentHandler,
  )

  .get('/:id', idValidationMiddleware, errorsCatchMiddleware, getPostHandler)

  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidationMiddleware,
    postDtoValidationMiddleware,
    errorsCatchMiddleware,
    putPostHandler,
  )

  .delete('/:id', superAdminGuardMiddleware, idValidationMiddleware, errorsCatchMiddleware, deletePostHandler);
