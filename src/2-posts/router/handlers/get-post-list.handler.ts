import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { postsService } from '../../application/posts.service';
import { matchedData } from 'express-validator';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { mapToPostListPaginatedOutput } from '../../mappers/map-to-postlist-paginated-output.util';

export async function getPostListHandler(req: Request, res: Response) {
  try {
    const queryData = matchedData(req, { locations: ['query'] });
    const queryInput = setDefaultSortAndPaginationIfNotExist(queryData);

    const { items, totalCount } = await postsService.findMany(
      queryInput as any,
    );

    const postsOutput = mapToPostListPaginatedOutput(items, {
      pageNumber: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      totalCount,
    });

    res.status(HttpStatus.Ok).send(postsOutput);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
