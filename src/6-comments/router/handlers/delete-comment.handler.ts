import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { commentsService } from '../../application/comments.service';

export async function deleteCommentHandler(req: Request, res: Response) {
  try {
    const comment = await commentsService.findById(req.params.id);

    if (!comment) {
      res.status(HttpStatus.NotFound).send(createErrorMessages([{ field: 'id', message: 'Comment not found' }]));
      return;
    }

    if (req.user!.id !== comment.commentatorInfo.userId) {
      res.sendStatus(HttpStatus.Forbidden);
      return;
    }

    await commentsService.delete(req.params.id);

    res.sendStatus(HttpStatus.NoContent);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
