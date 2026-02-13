import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/parking-reservatio.entity';
import { ReservationsService } from './parking-reservation.service';
import { ReservationsController } from './parking-reservation.controller';
import { QrModule } from '../qr/qr.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation]),
        QrModule,
    ],
    controllers: [ReservationsController],
    providers: [ReservationsService],
    exports: [ReservationsService],
})
export class ReservationsModule { }
