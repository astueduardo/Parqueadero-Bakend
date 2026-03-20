// reservations/reservations.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "./entities/parking-reservatio.entity";
import { ReservationsService } from "./parking-reservation.service";
import { ReservationsController } from "./parking-reservation.controller";
import { ParkingModule } from "../parking/parking.module"; // Importamos ParkingModule

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation]),
        ParkingModule, // Necesario para usar ParkingSpacesService
    ],
    controllers: [ReservationsController],
    providers: [ReservationsService],
    exports: [ReservationsService],
})
export class ReservationsModule { }