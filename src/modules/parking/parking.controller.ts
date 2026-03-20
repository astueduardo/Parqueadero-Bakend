import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { ParkingService } from "./parking.service";
import { ParkingSpacesService } from "./parking-spaces.service";
import {
    CreateParkingLotDto,
    UpdateParkingLotDto,
    CreateParkingSpaceDto,
    UpdateParkingSpaceDto,
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
        const ownerId = req.user.user_id || req.user.id;
        return this.parkingService.findMyLots(ownerId);
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.parkingService.findOneLot(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateParkingLotDto, @Request() req) {
        const ownerId = req.user.user_id || req.user.id;
        return this.parkingService.createLot(ownerId, dto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    update(@Param("id") id: string, @Body() dto: UpdateParkingLotDto, @Request() req) {
        const ownerId = req.user.user_id || req.user.id;
        return this.parkingService.updateLot(id, ownerId, dto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    remove(@Param("id") id: string, @Request() req) {
        const ownerId = req.user.user_id || req.user.id;
        return this.parkingService.deleteLot(id, ownerId);
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

    // ── Rutas estáticas PRIMERO ──────────────────
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

    // ── Rutas con parámetros DESPUÉS ─────────────
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
        const userId = req.user.user_id || req.user.id;
        return this.parkingService.createSpace(userId, dto);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() dto: UpdateParkingSpaceDto, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.parkingService.updateSpace(id, userId, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.OK)
    remove(@Param("id") id: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.parkingService.deleteSpace(id, userId);
    }
}