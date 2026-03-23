import {
    Controller, Post, Get, Patch,
    Param, Body, UseGuards, Request, HttpCode, HttpStatus,
} from "@nestjs/common";
import { ReservationsService } from "../reservations/parking-reservation.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ParkingReservationDto } from "./dto/parking-reservation.dto";

@Controller("reservations")
@UseGuards(JwtAuthGuard)
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Post()
    create(@Body() dto: ParkingReservationDto, @Request() req) {
        return this.reservationsService.create(req.user.id, dto);
    }

    @Get("my")
    findMy(@Request() req) {
        return this.reservationsService.findByUser(req.user.id);
    }

    @Get(":id")
    findOne(@Param("id") id: string, @Request() req) {
        return this.reservationsService.findOne(id, req.user.id);
    }

    @Patch(":id/cancel")
    @HttpCode(HttpStatus.OK)
    cancel(@Param("id") id: string, @Request() req) {
        return this.reservationsService.cancel(id, req.user.id);
    }
}