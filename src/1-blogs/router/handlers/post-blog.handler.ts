import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { BlogInputDto } from '../../dto/blog-input.dto';
import { mapToBlogViewModel } from '../../mappers/map-to-blog-view-model.util';
import { blogsService } from '../../application/blogs.service';

export async function postBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  try {
    const createdBlog = await blogsService.create(req.body);
    const blogViewModel = mapToBlogViewModel(createdBlog);

    res.status(HttpStatus.Created).send(blogViewModel);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
