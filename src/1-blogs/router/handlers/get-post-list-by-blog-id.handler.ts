import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { WithId } from 'mongodb';
import { Blog } from '../../types/blog';
import { postsService } from '../../../2-posts/application/posts.service';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { matchedData } from 'express-validator';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { mapToPostListPaginatedOutput } from '../../../2-posts/mappers/map-to-postlist-paginated-output.util';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function getPostListByBlogIdHandler(req: Request, res: Response) {
  try {
    const blog: WithId<Blog> | null = await blogsService.findById(
      req.params.id,
    );

    if (!blog) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Blog not found' }]),
        );
      return;
    }

    const queryData = matchedData(req, { locations: ['query'] });
    const queryInput = setDefaultSortAndPaginationIfNotExist(queryData);

    // делаем запрос за постами в которых блогАйди данный
    const { items, totalCount } = await postsService.findManyById(
      req.params.id,
      queryInput as any,
    );

    // мапим и возвращаем
    const postsOutput = mapToPostListPaginatedOutput(items, {
      pageNumber: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      totalCount,
    });

    res.status(HttpStatus.Ok).send(postsOutput);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
