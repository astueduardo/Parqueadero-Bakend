// reservations/reservations.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Reservation, ReservationStatus } from "./entities/parking-reservatio.entity";
import { ParkingSpacesService } from "../parking/parking-spaces.service";
import { ParkingReservationDto } from "./dto/parking-reservation.dto";

@Injectable()
export class ReservationsService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
        private readonly parkingSpacesService: ParkingSpacesService, // Para verificar disponibilidad
    ) { }

    async create(userId: string, dto: ParkingReservationDto): Promise<Reservation> {
        // 1. Verificar que el espacio existe y está disponible
        const isAvailable = await this.parkingSpacesService.isSpaceAvailable(dto.space_id);
        if (!isAvailable) {
            throw new BadRequestException('El espacio no está disponible para reservar');
        }

        // 2. Verificar que no haya reservaciones que se solapen (por si acaso)
        const overlapping = await this.reservationRepo.findOne({
            where: {
                spaceId: dto.space_id,
                status: In([ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.IN_PROGRESS]),
                // Lógica de solapamiento de fechas
            }
        });
        if (overlapping) {
            throw new BadRequestException('Ya existe una reservación para este espacio en el mismo horario');
        }

        // 3. Crear la reservación
        const reservation = this.reservationRepo.create({
            userId,
            spaceId: dto.space_id,
            vehicleId: dto.vehicle_id,
            startTime: new Date(dto.start_time),
            endTime: new Date(dto.end_time),
            status: ReservationStatus.PENDING,
            qrCode: this.generateQRCode(), // Implementa la generación de QR
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

        return { message: 'Reservación cancelada exitosamente' };
    }

    private generateQRCode(): string {
        // Implementa la generación de QR
        // Puedes usar librerías como 'qrcode' o generar un código único
        return `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
}