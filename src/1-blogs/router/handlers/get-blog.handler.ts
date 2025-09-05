import { Request, Response } from 'express';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { mapToBlogViewModel } from '../../mappers/map-to-blog-view-model.util';
import { blogsService } from '../../application/blogs.service';
import { WithId } from 'mongodb';
import { Blog } from '../../types/blog';

export async function getBlogHandler(req: Request, res: Response) {
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

    res.status(HttpStatus.Ok).send(mapToBlogViewModel(blog));
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
