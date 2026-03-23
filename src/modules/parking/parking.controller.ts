import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, UseGuards, Request, HttpCode, HttpStatus,
} from "@nestjs/common";
import { ParkingService } from "./parking.service";
import { ParkingSpacesService } from "./parking-spaces.service";
import {
    CreateParkingLotDto, UpdateParkingLotDto,
    CreateParkingSpaceDto, UpdateParkingSpaceDto,
} from "./dto/parking.dtos";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

// ═══════════════════════════════════════════════
//  PARKING LOTS CONTROLLER
// ═══════════════════════════════════════════════
@Controller("parking-lots")
export class ParkingLotsController {
    constructor(private readonly parkingService: ParkingService) { }

    @Get()
    findAll() {
        return this.parkingService.findAllLots();
    }

    @Get("owner/my")
    @UseGuards(JwtAuthGuard)
    findMine(@Request() req) {
        return this.parkingService.findMyLots(req.user.id);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.parkingService.findOneLot(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateParkingLotDto, @Request() req) {
        return this.parkingService.createLot(req.user.id, dto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    update(@Param("id") id: string, @Body() dto: UpdateParkingLotDto, @Request() req) {
        return this.parkingService.updateLot(id, req.user.id, dto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    remove(@Param("id") id: string, @Request() req) {
        return this.parkingService.deleteLot(id, req.user.id);
    }
}

// ═══════════════════════════════════════════════
//  PARKING SPACES CONTROLLER
// ═══════════════════════════════════════════════
@Controller("parking-spaces")
@UseGuards(JwtAuthGuard)
export class ParkingSpacesController {
    constructor(
        private readonly parkingService: ParkingService,
        private readonly spacesService: ParkingSpacesService,
    ) { }

    @Get("availability/all")
    getAllAvailability() {
        return this.spacesService.getAllLotsAvailability();
    }

    @Get("lot/:lotId")
    getByLot(@Param("lotId") lotId: string) {
        return this.spacesService.getSpacesByLot(lotId);
    }

    @Get("lot/:lotId/availability")
    getAvailability(@Param("lotId") lotId: string) {
        return this.spacesService.getAvailability(lotId);
    }

    @Get(":id/check")
    checkAvailable(@Param("id") id: string) {
        return this.spacesService.isSpaceAvailable(id);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.parkingService.findOneSpace(id);
    }

    @Post()
    create(@Body() dto: CreateParkingSpaceDto, @Request() req) {
        return this.parkingService.createSpace(req.user.id, dto);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() dto: UpdateParkingSpaceDto, @Request() req) {
        return this.parkingService.updateSpace(id, req.user.id, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.OK)
    remove(@Param("id") id: string, @Request() req) {
        return this.parkingService.deleteSpace(id, req.user.id);
    }
}