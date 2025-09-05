import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { UserInputModel } from '../../types/user-iput-model';
import { usersService } from '../../application/users.service';
import { usersQwRepository } from '../../qw-repository/users-qw-repository';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function postUserHandler(req: Request<{}, {}, UserInputModel>, res: Response) {
  try {
    const existsUserId = await usersQwRepository.findByEmailOrLogin(req.body.login || req.body.email);

    if (existsUserId) {
      res.status(HttpStatus.BadRequest).send(
        createErrorMessages([
          {
            field: 'email or login',
            message: 'the email address or login is not unique',
          },
        ]),
      );

      return;
    }

    const createdUserId = await usersService.create(req.body);
    const user = await usersQwRepository.findById(createdUserId);

    res.status(HttpStatus.Created).send(user);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
