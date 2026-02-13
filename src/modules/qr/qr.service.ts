import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reservation } from '../reservations/entities/parking-reservatio.entity';
import { ReservationStatus } from '../reservations/entities/parking-reservatio.entity';
import { QrValidation, ScanType } from './entites/qr-validation.entity';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    @InjectRepository(QrValidation)
    private readonly qrValidationRepo: Repository<QrValidation>,
  ) { }

  // =========================
  // GENERAR IMAGEN QR
  // =========================
  async generateQrImageUrl(data: string): Promise<string> {
    const encodedData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`;
  }

  async getQrImage(data: string): Promise<string> {
    return this.generateQrImageUrl(data);
  }
  // =========================
  // GENERAR QR BASE64
  // =========================
  async generateQrCode(data: string): Promise<string> {
    return await QRCode.toDataURL(data);
  }

  // =========================
  // GENERAR URL INTERNA QR
  // =========================
  generateReservationQrUrl(reservationId: string): string {
    return `${process.env.API_BASE_URL || 'http://localhost:3001/api'}/qr/${reservationId}/image`;
  }

  // =========================
  // VALIDAR QR
  // =========================
  async validateQr(reservationId: string, operatorId: string) {

    if (!reservationId) {
      throw new BadRequestException('reservation_id es requerido');
    }

    return await this.dataSource.transaction(async (manager) => {

      const reservation = await manager.findOne(Reservation, {
        where: { id: reservationId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!reservation) {
        throw new BadRequestException('Reserva no encontrada');
      }

      const now = new Date();

      // ========= ENTRY =========
      if (reservation.status === ReservationStatus.CONFIRMED) {

        const entryStart = new Date(reservation.start_time);
        entryStart.setMinutes(entryStart.getMinutes() - 5);

        const entryEnd = new Date(reservation.start_time);
        entryEnd.setMinutes(entryEnd.getMinutes() + 5);

        if (now > entryEnd) {
          reservation.status = ReservationStatus.NO_SHOW;
          await manager.save(reservation);
          throw new BadRequestException('Reserva vencida (NO_SHOW)');
        }

        if (now < entryStart) {
          throw new BadRequestException('Aún no está en ventana de entrada');
        }

        const existingEntry = await manager.findOne(QrValidation, {
          where: {
            reservation_id: reservationId,
            scan_type: ScanType.ENTRY,
          },
        });

        if (existingEntry) {
          throw new BadRequestException('Entrada ya registrada');
        }

        await manager.save(QrValidation, {
          reservation_id: reservationId,
          operator_id: operatorId,
          scan_type: ScanType.ENTRY,
        });

        reservation.status = ReservationStatus.IN_PROGRESS;
        await manager.save(reservation);

        return {
          success: true,
          type: ScanType.ENTRY,
          message: 'Entrada registrada correctamente',
        };
      }

      // ========= EXIT =========
      if (reservation.status === ReservationStatus.IN_PROGRESS) {

        const existingExit = await manager.findOne(QrValidation, {
          where: {
            reservation_id: reservationId,
            scan_type: ScanType.EXIT,
          },
        });

        if (existingExit) {
          throw new BadRequestException('Salida ya registrada');
        }

        await manager.save(QrValidation, {
          reservation_id: reservationId,
          operator_id: operatorId,
          scan_type: ScanType.EXIT,
        });

        reservation.status = ReservationStatus.COMPLETED;
        await manager.save(reservation);

        return {
          success: true,
          type: ScanType.EXIT,
          message: 'Salida registrada correctamente',
        };
      }

      if (reservation.status === ReservationStatus.COMPLETED) {
        throw new BadRequestException('Reserva ya finalizada');
      }

      if (reservation.status === ReservationStatus.NO_SHOW) {
        throw new BadRequestException('Reserva marcada como NO_SHOW');
      }

      throw new BadRequestException('Estado de reserva no válido');
    });
  }
}
