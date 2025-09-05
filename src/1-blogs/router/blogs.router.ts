import { Router } from 'express';
import { idValidationMiddleware } from '../../core/middlewares/validation/id-validation.middleware';
import { errorsCatchMiddleware } from '../../core/middlewares/validation/errors-catch.middleware';
import { superAdminGuardMiddleware } from '../../core/middlewares/validation/super-admin-guard.middleware';
import { blogDtoValidationMiddleware } from '../validation/blog-dto-validation.middleware';
import {
  deleteBlogHandler,
  getBlogHandler,
  getBlogListHandler,
  postBlogHandler,
  putBlogHandler,
} from './handlers';
import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation-middleware';
import { BlogSortField } from './input/blog-sort-field';
import { query } from 'express-validator';
import { PostSortField } from '../../2-posts/router/input/post-sort-field';
import { getPostListByBlogIdHandler } from './handlers/get-post-list-by-blog-id.handler';
import { postPostByBlogIdHandler } from './handlers/post-post-by-blog-id.handler';
import { postDtoByBlogIdValidationMiddleware } from '../validation/post-dto-by-blog-id-validation.middleware';

export const blogsRouter = Router({});

blogsRouter
  .get(
    '',
    paginationAndSortingValidation(BlogSortField),
    query('searchNameTerm').optional().trim(),
    errorsCatchMiddleware,
    getBlogListHandler,
  )

  .post(
    '',
    superAdminGuardMiddleware,
    blogDtoValidationMiddleware,
    errorsCatchMiddleware,
    postBlogHandler,
  )

  .get(
    '/:id/posts',
    idValidationMiddleware,
    paginationAndSortingValidation(PostSortField),
    errorsCatchMiddleware,
    getPostListByBlogIdHandler,
  )

  .post(
    '/:id/posts',
    superAdminGuardMiddleware,
    idValidationMiddleware,
    postDtoByBlogIdValidationMiddleware,
    errorsCatchMiddleware,
    postPostByBlogIdHandler,
  )

  .get('/:id', idValidationMiddleware, errorsCatchMiddleware, getBlogHandler)

  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidationMiddleware,
    blogDtoValidationMiddleware,
    errorsCatchMiddleware,
    putBlogHandler,
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidationMiddleware,
    errorsCatchMiddleware,
    deleteBlogHandler,
  );
