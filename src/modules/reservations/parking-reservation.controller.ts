import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Param,
    Delete,
    UnauthorizedException,
} from "@nestjs/common";
import { ReservationsService } from "./parking-reservation.service";
import { ParkingReservationDto } from "./dto/parking-reservation.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";

@Controller("reservations")
@UseGuards(JwtAuthGuard)
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Post()
    create(@Req() req: any, @Body() dto: ParkingReservationDto) {
        return this.reservationsService.create(req.user.id, dto);
    }

    @Get("my")
    findMyReservations(@Req() req: any) {
        return this.reservationsService.findByUser(req.user.id);
    }

    @Get(":id")
    async findOne(@Req() req: any, @Param("id") id: string) {
        const reservation = await this.reservationsService.findOne(id);

        // Validar que el usuario solo vea sus propias reservas
        if (
            reservation.user_id !== req.user.id &&
            req.user.role !== "admin"
        ) {
            throw new UnauthorizedException(
                "No tienes permiso para ver esta reserva",
            );
        }

        return reservation;
    }

    @Delete(":id")
    async cancel(@Req() req: any, @Param("id") id: string) {
        await this.reservationsService.cancel(id, req.user.id);
        return { success: true, message: "Reserva cancelada" };
    }
}
