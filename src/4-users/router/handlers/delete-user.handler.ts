import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { usersService } from '../../application/users.service';
import { usersQwRepository } from '../../qw-repository/users-qw-repository';

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const isExistsUser = await usersQwRepository.findById(req.params.id);

    if (!isExistsUser) {
      res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([{ field: 'id', message: 'User not found' }]),
        );
      return;
    }

    await usersService.delete(req.params.id);

    res.sendStatus(HttpStatus.NoContent);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
