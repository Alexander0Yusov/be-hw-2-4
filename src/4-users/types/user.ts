export type User = {
  accountData: {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
  };
  loginAttempts: [];
  emailConfirmation: {
    sentEmails: [];
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
};
