import { UserInputModel } from '../../../4-users/types/user-iput-model';

export const createFakeUser = (uniqueSymbol?: string): UserInputModel => {
  return {
    login: `fakeLogin${uniqueSymbol}`,
    email: `fakeemail${uniqueSymbol}@gmail.com`,
    password: 'qwerty123',
  };
};
