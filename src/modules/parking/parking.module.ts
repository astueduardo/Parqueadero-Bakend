// parking.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ParkingLot } from "./entities/parking-Lot.entity";
import { ParkingSpace } from "./entities/parking-space.entity";
import { Reservation } from "../reservations/entities/parking-reservatio.entity"; // Entidad de reservaciones
import { ParkingService } from "./parking.service";
import { ParkingSpacesService } from "./parking-spaces.service";
import { ParkingLotsController } from "./parking.controller"; // Controlador de lots
import { ParkingSpacesController } from "../parking/parking.controller"; // Controlador de espacios
// import { ReservationsController } from "../reservations/reservations.controller"; // Esto va en su propio módulo

@Module({
    imports: [
        TypeOrmModule.forFeature([ParkingLot, ParkingSpace, Reservation]),
    ],
    controllers: [
        ParkingLotsController,    // Para CRUD de parqueaderos
        ParkingSpacesController,  // Para consultar disponibilidad de espacios
    ],
    providers: [
        ParkingService,           // Servicio CRUD
        ParkingSpacesService,     // Servicio de disponibilidad
    ],
    exports: [ParkingService, ParkingSpacesService], // Exportamos para que reservations module los use
})
export class ParkingModule { }