import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Get,
  Query,
  Param
} from '@nestjs/common';

import { QrService } from './qr.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) { }

  // =========================
  // GENERAR QR (PÚBLICO)
  // =========================
  @Public()
  @Get('generate')
  async generateQr(@Query('reservation_id') reservationId: string) {
    if (!reservationId) {
      throw new BadRequestException('reservation_id es requerido');
    }

    const qrImageUrl = await this.qrService.generateQrImageUrl(reservationId);

    return {
      qr_code: reservationId,
      qr_image_url: qrImageUrl,
    };
  }

  // =========================
  // VALIDAR QR (ADMIN)
  // =========================
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  async validateQr(
    @Req() req,
    @Body() body: { reservation_id: string },
  ) {
    const operatorId = req.user?.id;

    if (!operatorId) {
      throw new BadRequestException('Operador no identificado');
    }

    if (!body?.reservation_id) {
      throw new BadRequestException('reservation_id es requerido');
    }

    return this.qrService.validateQr(body.reservation_id, operatorId);
  }

  // =========================
  // OBTENER IMAGEN QR
  // =========================
  @Public()
  @Get(':qrCode/image')
  async getQrImage(@Param('qrCode') qrCode: string) {
    if (!qrCode) {
      throw new BadRequestException('qrCode es requerido');
    }

    const imageUrl = await this.qrService.getQrImage(qrCode);

    return {
      qr_code: qrCode,
      image_url: imageUrl,
    };
  }
}
