import { WithId } from 'mongodb';
import { jwtService } from '../adapters/jwt.service';
import { ResultStatus } from '../../core/result/resultCode';
import { Result } from '../../core/result/result.type';
import { bcryptService } from '../adapters/bcrypt.service';
import { add, addSeconds } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { usersRepository } from '../../4-users/repository/users.repository';
import { User } from '../../4-users/types/user';
import { usersService } from '../../4-users/application/users.service';
import { nodemailerService } from '../adapters/nodemailer.service';
import { emailExamples } from '../adapters/email-examples';

export const authService = {
  async loginUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const result = await this.checkUserCredentials(loginOrEmail, password);

    if (result.status !== ResultStatus.Success)
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
        data: null,
      };

    const accessToken = await jwtService.createAccessToken(result.data!._id.toString());
    const refreshToken = await jwtService.createRefreshToken(result.data!._id.toString());

    const refreshTokenData = {
      value: refreshToken,
      createdAt: new Date(),
      expiresAt: addSeconds(new Date(), 20),
      isRevoked: false,
    };

    await usersRepository.setRefreshTokenById(result.data!._id, refreshTokenData);

    return {
      status: ResultStatus.Success,
      data: { accessToken, refreshToken },
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

    if (existsLogin) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'login', message: 'Login already exists' }],
      };
    }

    const existsEmail = await usersRepository.findByEmailOrLogin(email);

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

  async updateTokensPair(refreshToken: string): Promise<Result<Record<string, string> | null>> {
    const user = await usersRepository.findByRefreshToken(refreshToken);

    // нет токена в базе или он отозван
    if (!user || user.refreshTokens.find((tokenData) => tokenData.value === refreshToken)?.isRevoked === true) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Refresh token no valid' }],
        data: null,
      };
    }

    // если протух
    if (await jwtService.isTokenExpired(refreshToken)) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Refresh token already been expired' }],
        data: null,
      };
    }

    // меняем статус рефреш токена на негодный
    await usersRepository.setStatusIsRevokedForRefreshToken(refreshToken);

    // генерим новый и укладываем в базу
    const newRefreshToken = await jwtService.createRefreshToken(user._id.toString());
    const newAccessToken = await jwtService.createAccessToken(user._id.toString());

    const refreshTokenData = {
      value: newRefreshToken,
      createdAt: new Date(),
      expiresAt: addSeconds(new Date(), 20),
      isRevoked: false,
    };

    await usersRepository.setRefreshTokenById(user._id, refreshTokenData);

    return {
      status: ResultStatus.Success,
      data: { refreshToken: newRefreshToken, accessToken: newAccessToken },
      extensions: [],
    };
  },

  async logoutUser(refreshToken: string): Promise<Result<true | null>> {
    const user = await usersRepository.findByRefreshToken(refreshToken);

    // нет токена в базе или он отозван
    if (!user || user.refreshTokens.find((tokenData) => tokenData.value === refreshToken)?.isRevoked === true) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Refresh token not found' }],
        data: null,
      };
    }

    // если протух
    if (await jwtService.isTokenExpired(refreshToken)) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'refreshToken', message: 'Refresh token already been expired' }],
        data: null,
      };
    }

    // меняем статус рефреш токена на негодный
    await usersRepository.setStatusIsRevokedForRefreshToken(refreshToken);

    return {
      status: ResultStatus.NoContent,
      data: true,
      extensions: [],
    };
  },
};
