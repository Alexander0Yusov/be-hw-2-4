import { Request, Response } from 'express';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { commentsService } from '../../application/comments.service';

export async function getCommentHandler(req: Request, res: Response) {
  try {
    const comment = await commentsService.findById(req.params.id);

    if (!comment) {
      res.status(HttpStatus.NotFound).send(createErrorMessages([{ field: 'id', message: 'Comment not found' }]));
      return;
    }

    res.status(HttpStatus.Ok).send(comment);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
