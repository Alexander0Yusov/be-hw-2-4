import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/HttpStatus';
import { matchedData } from 'express-validator';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { usersQwRepository } from '../../qw-repository/users-qw-repository';
import { UserQueryInput } from '../input/user-query.input';

export async function getUserListHandler(req: Request, res: Response) {
  try {
    const queryData = matchedData(req, { locations: ['query'] });
    const queryInput = setDefaultSortAndPaginationIfNotExist(queryData);

    const searchResult = await usersQwRepository.findMany(
      queryInput as UserQueryInput,
    );

    res.status(HttpStatus.Ok).send(searchResult);
  } catch (error: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
