import {
    Injectable, BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Reservation, ReservationStatus } from '../reservations/entities/parking-reservatio.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
        private readonly configService: ConfigService,
    ) {
        this.stripe = new Stripe(
            this.configService.get<string>('STRIPE_SECRET_KEY')!,
            { apiVersion: '2025-12-15' as any },
        );
    }

    // ── Paso 1: Crear PaymentIntent → devuelve client_secret ──
    async createPaymentIntent(userId: string, dto: CreatePaymentDto) {
        // 1. Verificar reserva
        const reservation = await this.reservationRepo.findOne({
            where: { id: dto.reservation_id, userId },
            relations: ['space', 'space.lot'],
        });

        if (!reservation) {
            throw new NotFoundException('Reserva no encontrada');
        }

        if (reservation.status === ReservationStatus.CANCELLED) {
            throw new BadRequestException('No se puede pagar una reserva cancelada');
        }

        // 2. Verificar pago previo
        const existingPayment = await this.paymentRepo.findOne({
            where: {
                reservation_id: dto.reservation_id,
                status: PaymentStatus.SUCCEEDED,
            },
        });
        if (existingPayment) {
            throw new BadRequestException('Esta reserva ya tiene un pago exitoso');
        }

        // 3. Calcular monto
        const pricePerHour = Number(reservation.space.lot.price) || 1;
        const hours = Math.ceil(
            (new Date(reservation.endTime).getTime() - new Date(reservation.startTime).getTime())
            / (1000 * 60 * 60)
        );
        const amount = pricePerHour * hours;

        // 4. Crear PaymentIntent en Stripe
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // centavos
            currency: this.configService.get<string>('STRIPE_CURRENCY') || 'usd',
            metadata: {
                reservation_id: reservation.id,
                user_id: userId,
            },
        });

        // 5. Guardar pago en estado PENDING
        await this.paymentRepo.save(
            this.paymentRepo.create({
                user_id: userId,
                reservation_id: dto.reservation_id,
                amount,
                currency: 'USD',
                payment_method: 'card',
                external_reference: paymentIntent.id,
                status: PaymentStatus.PENDING,
            })
        );

        // 6. Devolver client_secret al frontend
        return {
            client_secret: paymentIntent.client_secret,
            amount,
            currency: 'USD',
            reservation_id: dto.reservation_id,
        };
    }

    // ── Paso 2: Frontend confirma → notifica al backend ──
    async confirmPayment(userId: string, paymentIntentId: string) {
        // 1. Verificar en Stripe que el pago realmente fue exitoso
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new BadRequestException(`Pago no completado. Estado: ${paymentIntent.status}`);
        }

        // 2. Actualizar pago en BD
        const payment = await this.paymentRepo.findOne({
            where: { external_reference: paymentIntentId, user_id: userId },
        });

        if (!payment) {
            throw new NotFoundException('Pago no encontrado');
        }

        payment.status = PaymentStatus.SUCCEEDED;
        await this.paymentRepo.save(payment);

        // 3. Confirmar reserva
        const reservation = await this.reservationRepo.findOne({
            where: { id: payment.reservation_id },
        });

        if (reservation) {
            reservation.status = ReservationStatus.CONFIRMED;
            await this.reservationRepo.save(reservation);
        }

        return { message: 'Pago confirmado', payment };
    }

    // ── Historial de pagos ────────────────────────
    async getMyPayments(userId: string): Promise<Payment[]> {
        return this.paymentRepo.find({
            where: { user_id: userId },
            relations: ['reservation', 'reservation.space', 'reservation.space.lot'],
            order: { created_at: 'DESC' },
        });
    }

    // ── Ver un pago ───────────────────────────────
    async getPayment(id: string, userId: string): Promise<Payment> {
        const payment = await this.paymentRepo.findOne({
            where: { id, user_id: userId },
            relations: ['reservation'],
        });
        if (!payment) throw new NotFoundException('Pago no encontrado');
        return payment;
    }

    // ── Publishable key para el frontend ─────────
    getPublishableKey(): { publishable_key: string } {
        return {
            publishable_key: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY') || '',
        };
    }
}