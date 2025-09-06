import { randomUUID } from 'crypto';
import { add } from 'date-fns/add';
import { db } from '../../db/mongo.db';
import { User } from '../../4-users/types/user';

type RegisterUserPayloadType = {
  login: string;
  pass: string;
  email: string;
  code?: string;
  expirationDate?: Date;
  isConfirmed?: boolean;
};

export type RegisterUserResultType = {
  id: string;
  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  };
  loginAttempts: any[];
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
};

export const testSeeder = {
  createUserDto() {
    return {
      login: 'testing',
      email: 'test@gmail.com',
      pass: '123456789',
    };
  },

  createUserDtos(count: number) {
    const users = [];

    for (let i = 0; i <= count; i++) {
      users.push({
        login: 'test' + i,
        email: `test${i}@gmail.com`,
        pass: '12345678',
      });
    }
    return users;
  },

  async insertUser({
    login,
    pass,
    email,
    code,
    expirationDate,
    isConfirmed,
  }: RegisterUserPayloadType): Promise<RegisterUserResultType> {
    const newUser: User = {
      accountData: {
        login,
        email,
        passwordHash: pass,
        createdAt: new Date(),
      },
      refreshTokens: [],
      loginAttempts: [],
      emailConfirmation: {
        sentEmails: [],
        confirmationCode: code ?? randomUUID(),
        expirationDate: expirationDate ?? add(new Date(), { hours: 1 }),
        isConfirmed: isConfirmed ?? false,
      },
    };

    const res = await db.getCollections().userCollection.insertOne({ ...newUser });

    return {
      id: res.insertedId.toString(),
      ...newUser,
    };
  },
};
