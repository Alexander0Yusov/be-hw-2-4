import { Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { postsService } from '../../application/posts.service';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { commentsService } from '../../../6-comments/application/comments.service';
import { RequestWithParamsAndBodyAndUserId } from '../../../core/types/requests';
import { IdType } from '../../../core/types/id';
import { CommentInputDto } from '../../../6-comments/dto/comment-input.dto';
import { usersQwRepository } from '../../../4-users/qw-repository/users-qw-repository';

export async function postCommentHandler(
  req: RequestWithParamsAndBodyAndUserId<IdType, CommentInputDto, IdType>,
  res: Response,
) {
  try {
    const post = await postsService.findById(req.params.id);

    if (!post) {
      res.status(HttpStatus.NotFound).send(createErrorMessages([{ field: 'id', message: 'Post not found' }]));
      return;
    }

    const user = await usersQwRepository.findById(req.user!.id);

    if (!user) {
      res.status(HttpStatus.NotFound).send(createErrorMessages([{ field: 'id', message: 'User not found' }]));
      return;
    }

    const createdComment = await commentsService.create(req.body, user.id, user.login, post._id);

    res.status(HttpStatus.Created).send(createdComment);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
