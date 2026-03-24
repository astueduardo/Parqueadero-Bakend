import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { QrValidation } from './entites/qr-validation.entity';
import { Reservation } from '../reservations/entities/parking-reservatio.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QrValidation, Reservation]),
    NotificationsModule,

  ],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule { }
