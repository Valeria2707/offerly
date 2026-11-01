import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { escapeHtml } from '@offerly/helpers';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { PASSWORD_RESET_TTL_MINUTES } from './auth.constants';

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

  async sendPasswordReset(
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    const resetUrl = `${this.config.getOrThrow<string>('APP_BASE_URL')}/reset-password?token=${encodeURIComponent(token)}`;
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('SMTP_FROM'),
      to: email,
      subject: 'Відновлення пароля Offerly',
      text: `Вітаємо, ${name}. Щоб встановити новий пароль, відкрийте: ${resetUrl}. Посилання діє ${PASSWORD_RESET_TTL_MINUTES} хвилин.`,
      html: `<p>Вітаємо, ${escapeHtml(name)}.</p><p><a href="${resetUrl}">Встановити новий пароль</a></p><p>Посилання діє ${PASSWORD_RESET_TTL_MINUTES} хвилин.</p>`
    });
  }

  async send(email: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('SMTP_FROM'),
      to: email,
      subject,
      html
    });
  }
}
