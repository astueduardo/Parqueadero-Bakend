// reservations/reservations.controller.ts
import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { ReservationsService } from "../reservations/parking-reservation.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ParkingReservationDto } from "./dto/parking-reservation.dto"; // ← Usamos tu DTO existente

@Controller("reservations")
@UseGuards(JwtAuthGuard)
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Post()
    create(@Body() dto: ParkingReservationDto, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.reservationsService.create(userId, dto);
    }

    @Get("my")
    findMy(@Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.reservationsService.findByUser(userId);
    }

    @Get(":id")
    findOne(@Param("id") id: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.reservationsService.findOne(id, userId);
    }

    @Patch(":id/cancel")
    @HttpCode(HttpStatus.OK)
    cancel(@Param("id") id: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.reservationsService.cancel(id, userId);
    }
}