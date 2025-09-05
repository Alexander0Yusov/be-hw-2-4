import { Request, Response } from 'express';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { blogsService } from '../../application/blogs.service';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { matchedData } from 'express-validator';
import { mapToBlogListPaginatedOutput } from '../../mappers/map-to-bloglist-paginated-output.util';

export async function getBlogListHandler(req: Request, res: Response) {
  try {
    const queryData = matchedData(req, { locations: ['query'] });
    const queryInput = setDefaultSortAndPaginationIfNotExist(queryData);

    const { items, totalCount } = await blogsService.findMany(
      queryInput as any,
    );

    const blogsOutput = mapToBlogListPaginatedOutput(items, {
      pageNumber: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      totalCount,
    });

    res.status(HttpStatus.Ok).send(blogsOutput);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
