import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { usersRepository } from '../repository/users.repository';
import { User } from '../types/user';
import { UserInputModel } from '../types/user-iput-model';

export const usersService = {
  async create(dto: UserInputModel): Promise<string> {
    const saltRounds = 10;

    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const newUser: User = {
      accountData: {
        login: dto.login,
        email: dto.email,
        passwordHash,
        createdAt: new Date(),
      },
      refreshTokens: [],
      loginAttempts: [],
      emailConfirmation: {
        sentEmails: [],
        confirmationCode: uuidv4(),
        expirationDate: add(new Date(), { hours: 1 }),
        isConfirmed: false,
      },
    };

    const newUserId = await usersRepository.create(newUser);

    return newUserId;
  },

  async delete(id: string): Promise<void> {
    await usersRepository.delete(id);
    return;
  },
};
