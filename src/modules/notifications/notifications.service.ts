import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  // TODO: Implementar con Firebase Cloud Messaging
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
  ): Promise<void> {
    this.logger.warn(`[PENDIENTE] Push → userId: ${userId} | ${title}: ${body}`);
  }

  // TODO: Implementar con SendGrid o similar
  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    this.logger.warn(`[PENDIENTE] Email → ${to} | ${subject}`);
  }

  // TODO: Implementar con Twilio o similar
  async sendSms(
    phone: string,
    message: string,
  ): Promise<void> {
    this.logger.warn(`[PENDIENTE] SMS → ${phone} | ${message}`);
  }
}