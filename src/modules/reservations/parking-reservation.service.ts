// reservations/reservations.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Reservation, ReservationStatus } from "./entities/parking-reservatio.entity";
import { ParkingSpacesService } from "../parking/parking-spaces.service";
import { ParkingReservationDto } from "./dto/parking-reservation.dto";
import { NotificationsService } from '../notifications/notifications.service';
@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
        private readonly parkingSpacesService: ParkingSpacesService,
        private readonly notificationsService: NotificationsService,

    ) { }

    async create(userId: string, dto: ParkingReservationDto): Promise<Reservation> {
        const isAvailable = await this.parkingSpacesService.isSpaceAvailable(dto.space_id);
        if (!isAvailable) {
            throw new BadRequestException('El espacio no está disponible');
        }

        // ✅ Verificación real de solapamiento de fechas
        const overlapping = await this.reservationRepo
            .createQueryBuilder('r')
            .where('r.spaceId = :spaceId', { spaceId: dto.space_id })
            .andWhere('r.status IN (:...statuses)', {
                statuses: [
                    ReservationStatus.PENDING,
                    ReservationStatus.CONFIRMED,
                    ReservationStatus.IN_PROGRESS,
                ],
            })
            .andWhere('r.startTime < :endTime', { endTime: new Date(dto.end_time) })
            .andWhere('r.endTime > :startTime', { startTime: new Date(dto.start_time) })
            .getOne();

        if (overlapping) {
            throw new BadRequestException('El espacio ya está reservado en ese horario');
        }

        const reservation = this.reservationRepo.create({
            userId,
            spaceId: dto.space_id,
            vehicleId: dto.vehicle_id,
            startTime: new Date(dto.start_time),
            endTime: new Date(dto.end_time),
            status: ReservationStatus.PENDING,
            qrCode: `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        });

        return this.reservationRepo.save(reservation);
    }
    async findByUser(userId: string): Promise<Reservation[]> {
        return this.reservationRepo.find({
            where: { userId },
            relations: ['space', 'space.lot', 'vehicle'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, userId: string): Promise<Reservation> {
        const reservation = await this.reservationRepo.findOne({
            where: { id },
            relations: ['space', 'space.lot', 'vehicle'],
        });

        if (!reservation) {
            throw new NotFoundException('Reservación no encontrada');
        }

        // Verificar que la reservación pertenece al usuario
        if (reservation.userId !== userId) {
            throw new ForbiddenException('No tienes permiso para ver esta reservación');
        }

        return reservation;
    }

    async cancel(id: string, userId: string): Promise<{ message: string }> {
        const reservation = await this.findOne(id, userId);

        if (reservation.status === ReservationStatus.COMPLETED) {
            throw new BadRequestException('No se puede cancelar una reservación completada');
        }

        if (reservation.status === ReservationStatus.CANCELLED) {
            throw new BadRequestException('La reservación ya está cancelada');
        }

        reservation.status = ReservationStatus.CANCELLED;
        await this.reservationRepo.save(reservation);
        await this.notificationsService.notifyReservationCancelled(
            reservation.userId,
            reservation.space.lot.name,
        );
        return { message: 'Reservación cancelada exitosamente' };
    }


}