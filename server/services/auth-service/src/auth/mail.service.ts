import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService) {
    const user = config.get<string>('SMTP_USER') || undefined;
    const pass = config.get<string>('SMTP_PASSWORD') || undefined;
    this.transporter = nodemailer.createTransport({
      host: config.getOrThrow<string>('SMTP_HOST'),
      port: config.getOrThrow<number>('SMTP_PORT'),
      secure: config.getOrThrow<boolean>('SMTP_SECURE'),
      auth: user && pass ? { user, pass } : undefined
    });
  }

  async sendPasswordReset(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${this.config.getOrThrow<string>('APP_BASE_URL')}/reset-password?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('SMTP_FROM'),
      to: email,
      subject: 'Відновлення пароля Offerly',
      text: `Вітаємо, ${name}. Щоб встановити новий пароль, відкрийте: ${resetUrl}. Посилання діє 30 хвилин.`,
      html: `<p>Вітаємо, ${name}.</p><p><a href="${resetUrl}">Встановити новий пароль</a></p><p>Посилання діє 30 хвилин.</p>`
    });
  }
}
