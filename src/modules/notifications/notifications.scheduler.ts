import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Reservation, ReservationStatus } from '../reservations/entities/parking-reservatio.entity';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
        private readonly notificationsService: NotificationsService,
    ) { }

    // Corre cada minuto
    @Cron(CronExpression.EVERY_MINUTE)
    async checkExpiringReservations() {
        const now = new Date();
        const in15Min = new Date(now.getTime() + 15 * 60 * 1000);
        const in16Min = new Date(now.getTime() + 16 * 60 * 1000);

        // Reservas que vencen en exactamente 15 minutos
        const expiring = await this.reservationRepo.find({
            where: {
                status: ReservationStatus.IN_PROGRESS,
                endTime: Between(in15Min, in16Min),
            },
            relations: ['space'],
        });

        for (const reservation of expiring) {
            await this.notificationsService.notifyReservationExpiringSoon(
                reservation.userId,
                15,
                reservation.space.code,
            );
        }
    }
}