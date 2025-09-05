import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { blogsService } from '../../application/blogs.service';

export async function putBlogHandler(req: Request, res: Response) {
  try {
    const blog = await blogsService.findById(req.params.id);

    if (!blog) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Blog not found' }]),
        );
      return;
    }

    await blogsService.update(req.params.id, req.body);

    res.sendStatus(HttpStatus.NoContent);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
