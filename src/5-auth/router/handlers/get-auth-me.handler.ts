import { Response } from 'express';
import { IdType } from '../../../core/types/id';
import { RequestWithUserId } from '../../../core/types/requests';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { usersQwRepository } from '../../../4-users/qw-repository/users-qw-repository';

export async function getAuthMeHandler(req: RequestWithUserId<IdType>, res: Response) {
  const userId = req.user?.id as string;

  if (!userId) return res.sendStatus(HttpStatus.Unauthorized);

  const me = await usersQwRepository.findById(userId);

  return res.status(HttpStatus.Ok).send({
    email: me?.email,
    login: me?.login,
    userId: me?.id,
  });
}
