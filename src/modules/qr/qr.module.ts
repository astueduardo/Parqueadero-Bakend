import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { QrValidation } from './entites/qr-validation.entity';
import { Reservation } from '../reservations/entities/parking-reservatio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QrValidation, Reservation]),
  ],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule { }
