import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class ConfirmPaymentDto {
    @IsString()
    @IsNotEmpty()
    payment_intent_id!: string;
}

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    // Publishable key para el frontend
    @Get('config')
    getConfig() {
        return this.paymentsService.getPublishableKey();
    }

    // Paso 1 — Frontend solicita client_secret
    @Post('create-intent')
    createIntent(@Body() dto: CreatePaymentDto, @Request() req) {
        return this.paymentsService.createPaymentIntent(req.user.id, dto);
    }

    // Paso 2 — Frontend confirma que Stripe procesó el pago
    @Post('confirm')
    confirm(@Body() dto: ConfirmPaymentDto, @Request() req) {
        return this.paymentsService.confirmPayment(req.user.id, dto.payment_intent_id);
    }

    // Historial
    @Get('my')
    getMyPayments(@Request() req) {
        return this.paymentsService.getMyPayments(req.user.id);
    }

    // Ver uno
    @Get(':id')
    getOne(@Param('id') id: string, @Request() req) {
        return this.paymentsService.getPayment(id, req.user.id);
    }
}