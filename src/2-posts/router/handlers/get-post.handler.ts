import { Request, Response } from 'express';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { mapToPostViewModel } from '../../mappers/map-to-post-view-model.util';
import { postsService } from '../../application/posts.service';

export async function getPostHandler(req: Request, res: Response) {
  try {
    const post = await postsService.findById(req.params.id);

    if (!post) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'Post not found' }]),
        );
      return;
    }

    res.status(HttpStatus.Ok).send(mapToPostViewModel(post));
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
