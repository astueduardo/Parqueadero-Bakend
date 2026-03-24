import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { User } from '../users/entities/user.entity';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo: Expo;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    this.expo = new Expo();
  }

  // ── Guardar token del dispositivo ─────────────
  async savePushToken(userId: string, token: string): Promise<void> {
    if (!Expo.isExpoPushToken(token)) {
      this.logger.warn(`Token inválido para usuario ${userId}: ${token}`);
      return;
    }
    await this.userRepo.update(userId, { push_token: token });
  }

  // ── Enviar a un usuario específico ────────────
  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user?.push_token) {
      this.logger.warn(`Usuario ${userId} sin push_token`);
      return;
    }

    await this.sendPush(user.push_token, payload);
  }

  // ── Enviar a múltiples usuarios ───────────────
  async sendToUsers(userIds: string[], payload: NotificationPayload): Promise<void> {
    const users = await this.userRepo
      .createQueryBuilder('u')
      .where('u.id IN (:...ids)', { ids: userIds })
      .andWhere('u.push_token IS NOT NULL')
      .getMany();

    const tokens = users
      .map(u => u.push_token!)
      .filter(t => Expo.isExpoPushToken(t));

    await Promise.all(tokens.map(token => this.sendPush(token, payload)));
  }

  // ── Lógica central de envío ───────────────────
  private async sendPush(token: string, payload: NotificationPayload): Promise<void> {
    const message: ExpoPushMessage = {
      to: token,
      sound: 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    };

    try {
      const chunks = this.expo.chunkPushNotifications([message]);
      for (const chunk of chunks) {
        const tickets: ExpoPushTicket[] = await this.expo.sendPushNotificationsAsync(chunk);
        for (const ticket of tickets) {
          if (ticket.status === 'error') {
            this.logger.error(`Error enviando push: ${ticket.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error en sendPush: ${error}`);
    }
  }

  // ── Métodos por evento ────────────────────────

  async notifyReservationConfirmed(userId: string, parkingName: string, spaceCode: string) {
    await this.sendToUser(userId, {
      title: '✅ Reserva confirmada',
      body: `Tu espacio ${spaceCode} en ${parkingName} está reservado`,
      data: { type: 'reservation_confirmed' },
    });
  }

  async notifyReservationCancelled(userId: string, parkingName: string) {
    await this.sendToUser(userId, {
      title: '❌ Reserva cancelada',
      body: `Tu reserva en ${parkingName} fue cancelada`,
      data: { type: 'reservation_cancelled' },
    });
  }

  async notifyPaymentSucceeded(userId: string, amount: number) {
    await this.sendToUser(userId, {
      title: '💳 Pago exitoso',
      body: `Se procesó tu pago de $${amount.toFixed(2)} correctamente`,
      data: { type: 'payment_succeeded' },
    });
  }

  async notifyPaymentFailed(userId: string) {
    await this.sendToUser(userId, {
      title: '⚠️ Pago fallido',
      body: 'Tu tarjeta fue rechazada. Intenta con otro método de pago',
      data: { type: 'payment_failed' },
    });
  }

  async notifyQrEntry(userId: string, parkingName: string) {
    await this.sendToUser(userId, {
      title: '🚗 Entrada registrada',
      body: `Bienvenido a ${parkingName}`,
      data: { type: 'qr_entry' },
    });
  }

  async notifyQrExit(userId: string, parkingName: string) {
    await this.sendToUser(userId, {
      title: '👋 Salida registrada',
      body: `Hasta pronto de ${parkingName}`,
      data: { type: 'qr_exit' },
    });
  }

  async notifyReservationExpiringSoon(userId: string, minutesLeft: number, spaceCode: string) {
    await this.sendToUser(userId, {
      title: '⏰ Reserva por vencer',
      body: `Tu espacio ${spaceCode} vence en ${minutesLeft} minutos`,
      data: { type: 'reservation_expiring' },
    });
  }
}