import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThan, MoreThan } from "typeorm";
import { Reservation } from "./entities/parking-reservatio.entity";
import { ParkingReservationDto } from "./dto/parking-reservation.dto";
import { ReservationStatus } from "../reservations/entities/parking-reservatio.entity";
import { QrService } from "../qr/qr.service";
import { v4 as uuid } from "uuid";
import * as QRCode from 'qrcode';

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
        private readonly qrService: QrService,
    ) { }

    async create(userId: string, dto: ParkingReservationDto) {

        if (new Date(dto.start_time) >= new Date(dto.end_time)) {
            throw new BadRequestException(
                'La hora de inicio debe ser anterior a la hora de fin',
            );
        }

        if (new Date(dto.start_time) < new Date()) {
            throw new BadRequestException(
                'No puedes hacer reservas en el pasado',
            );
        }

        const conflicts = await this.reservationRepo.find({
            where: {
                space_id: dto.space_id,
                status: ReservationStatus.PENDING,
                start_time: LessThan(new Date(dto.end_time)),
                end_time: MoreThan(new Date(dto.start_time)),
            },
        });

        if (conflicts.length > 0) {
            throw new BadRequestException(
                'El espacio ya está reservado en ese horario',
            );
        }

        const reservationId = uuid();

        // Generar QR en base64
        const qrBase64 = await this.qrService.generateQrCode(reservationId);

        const reservation = this.reservationRepo.create({
            id: reservationId,
            user_id: userId,
            space_id: dto.space_id,
            vehicle_id: dto.vehicle_id,
            start_time: new Date(dto.start_time),
            end_time: new Date(dto.end_time),
            status: ReservationStatus.PENDING,
            qr_code: reservationId, // guardamos el ID como contenido QR
        });

        const saved = await this.reservationRepo.save(reservation);

        return {
            ...saved,
            qr_image: qrBase64,
            qr_url: this.qrService.generateReservationQrUrl(reservationId),
        };
    }

    async findByUser(userId: string) {
        return this.reservationRepo.find({
            where: { user_id: userId },
            relations: ['space', 'space.lot'],
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: string) {
        const reservation = await this.reservationRepo.findOne({
            where: { id },
            relations: ['space', 'space.lot', 'user'],
        });

        if (!reservation) {
            throw new NotFoundException('Reserva no encontrada');
        }

        return reservation;
    }

    async cancel(id: string, userId: string) {
        const reservation = await this.findOne(id);

        if (reservation.user_id !== userId) {
            throw new BadRequestException(
                'No tienes permiso para cancelar esta reserva',
            );
        }

        if (reservation.start_time < new Date()) {
            throw new BadRequestException(
                'No puedes cancelar una reserva que ya comenzó',
            );
        }

        reservation.status = ReservationStatus.CANCELLED;

        return this.reservationRepo.save(reservation);
    }
    async updateStatus(id: string, status: ReservationStatus) {
        const reservation = await this.findOne(id);
        reservation.status = status;
        return this.reservationRepo.save(reservation);
    }

}
