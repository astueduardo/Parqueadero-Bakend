import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLotsService } from '../parking-lots/parking.lots.service';
import { ParkingLotsController } from '../parking-lots/parking-lots.controller';
import { ParkingLot } from '../entities/parking-Lot.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ParkingLot]),
    ],
    controllers: [ParkingLotsController],
    providers: [ParkingLotsService],
    exports: [ParkingLotsService],
})
export class ParkingModule { }