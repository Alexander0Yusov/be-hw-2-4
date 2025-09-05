import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { commentsService } from '../../application/comments.service';

export async function putCommentHandler(req: Request, res: Response) {
  try {
    const comment = await commentsService.findById(req.params.id);

    if (!comment) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    if (req.user!.id !== comment.commentatorInfo.userId) {
      res.sendStatus(HttpStatus.Forbidden);
      return;
    }

    await commentsService.update(req.params.id, req.body);

    res.sendStatus(HttpStatus.NoContent);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
