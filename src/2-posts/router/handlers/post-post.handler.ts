import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { PostInputDto } from '../../dto/post-input.dto';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model.util';
import { postsService } from '../../application/posts.service';
import { blogsService } from '../../../1-blogs/application/blogs.service';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function postPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) {
  try {
    const blog = await blogsService.findById(req.body.blogId);

    if (!blog) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Blog not found' }]),
        );
      return;
    }

    const createdPost = await postsService.create(
      req.body,
      req.body.blogId,
      blog.name,
    );

    const postViewModel = mapToPostViewModel(createdPost);

    res.status(HttpStatus.Created).send(postViewModel);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
