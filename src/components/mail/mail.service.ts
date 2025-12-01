import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '../../libs/entities/user';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendUserWelcome(user: User, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService
      .sendMail({
        to: user.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to Nice App! Confirm your Email',
        template: './welcome', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: user.fullName,
          url,
        },
      })
      .then(() => {
        this.logger.log(`Email sent to ${user.email}`);
      })
      .catch((e) => {
        this.logger.error(`Failed to send email to ${user.email}`, e);
      });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    await this.mailerService
      .sendMail({
        to,
        subject,
        text,
        html,
      })
      .then(() => {
        this.logger.log(`Email sent to ${to}`);
      })
      .catch((e) => {
        this.logger.error(`Failed to send email to ${to}`, e);
      });
  }
}
