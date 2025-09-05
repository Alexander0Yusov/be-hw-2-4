import { WithId } from 'mongodb';
import { Blog } from '../../types/blog';
import { blogsService } from '../../application/blogs.service';
import { Request, Response } from 'express';
import { postsService } from '../../../2-posts/application/posts.service';
import { mapToPostViewModel } from '../../../2-posts/mappers/map-to-post-view-model.util';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function postPostByBlogIdHandler(req: Request, res: Response) {
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

    const createdPost = await postsService.create(
      req.body,
      blog._id.toString(),
      blog.name,
    );

    const postsOutput = mapToPostViewModel(createdPost);

    res.status(HttpStatus.Created).send(postsOutput);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
