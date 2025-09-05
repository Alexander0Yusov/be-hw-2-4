import { WithId } from 'mongodb';
import { jwtService } from '../adapters/jwt.service';
import { ResultStatus } from '../../core/result/resultCode';
import { Result } from '../../core/result/result.type';
import { bcryptService } from '../adapters/bcrypt.service';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { usersRepository } from '../../4-users/repository/users.repository';
import { User } from '../../4-users/types/user';
import { usersService } from '../../4-users/application/users.service';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/email-examples';
import { db } from '../../db/mongo.db';

export const authService = {
  async loginUser(loginOrEmail: string, password: string): Promise<Result<{ accessToken: string } | null>> {
    const result = await this.checkUserCredentials(loginOrEmail, password);

    if (result.status !== ResultStatus.Success)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
        data: null,
      };

    const accessToken = await jwtService.createToken(result.data!._id.toString());

    return {
      status: ResultStatus.Success,
      data: { accessToken },
      extensions: [],
    };
  },

  async checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<WithId<User> | null>> {
    const user = await usersRepository.findByEmailOrLogin(loginOrEmail);

    if (!user)
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };

    const isPassCorrect = await bcryptService.checkPassword(password, user.accountData.passwordHash);

    if (!isPassCorrect)
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'password', message: 'Wrong password' }],
      };

    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },

  async registerUser(login: string, email: string, password: string): Promise<Result<WithId<User> | null>> {
    const existsLogin = await usersRepository.findByEmailOrLogin(login);
    const existsEmail = await usersRepository.findByEmailOrLogin(email);

    if (existsLogin) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'login', message: 'Login already exists' }],
      };
    }

    if (existsEmail) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'Email already exists' }],
      };
    }

    const userId = await usersService.create({ login, email, password });
    const user = await usersRepository.findById(userId);

    try {
      await nodemailerService.sendEmail(
        user!.accountData.email,
        user!.emailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      );

      return {
        status: ResultStatus.NoContent,
        data: user,
        extensions: [],
      };
    } catch (error) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'Internal error', message: 'Mail service error' }],
      };
    }
  },

  async confirmEmail(code: string): Promise<Result<true | null>> {
    const user = await usersRepository.findByCode(code);

    // console.log(4444, code);
    // console.log(5555, await db.getCollections().userCollection.find().toArray());

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'code', message: 'The confirmation code is not found' }],
        data: null,
      };
    }

    if (user.emailConfirmation.expirationDate < new Date() || user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'code', message: 'The confirmation code expired or already been applied' }],
        data: null,
      };
    }

    await usersRepository.confirmEmail(code);

    return {
      status: ResultStatus.NoContent,
      data: true,
      extensions: [],
    };
  },

  async resendConfirmationCode(email: string): Promise<Result<true | null>> {
    const user = await usersRepository.findByEmailOrLogin(email);

    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'email', message: 'Email not found' }],
        data: null,
      };
    }

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: 'BadRequest',
        extensions: [{ field: 'email', message: 'Email already been confirmed' }],
        data: null,
      };
    }

    const newCode = uuidv4();

    // устанавливаем новый код и время экспирации
    await usersRepository.prolongationConfirmationCode(email, newCode, add(new Date(), { hours: 1 }));

    // отправляем письмо на почту
    await nodemailerService.sendEmail(email, newCode, emailExamples.registrationEmail);

    return {
      status: ResultStatus.NoContent,
      data: true,
      extensions: [],
    };
  },
};
