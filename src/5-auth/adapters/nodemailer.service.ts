import nodemailer from 'nodemailer';
import { SETTINGS } from '../../core/settings/settings';

export const nodemailerService = {
  async sendEmail(email: string, code: string, template: (code: string) => string): Promise<boolean> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SETTINGS.EMAIL,
        pass: SETTINGS.EMAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: '"Kek 👻" <codeSender>',
      to: email,
      subject: 'Your code is here',
      html: template(code), // html body
    });

    return !!info;
  },
};
