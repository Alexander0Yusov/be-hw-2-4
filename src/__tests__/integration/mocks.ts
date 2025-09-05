import { nodemailerService } from '../../5-auth/adapters/nodemailer.service';

export const emailServiceMock: typeof nodemailerService = {
  async sendEmail(email: string, code: string, template: (code: string) => string): Promise<boolean> {
    return true;
  },
};
