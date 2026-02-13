import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Req,
    UseGuards,
} from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto } from "./db/create-vehicle.dto";
import { UpdateVehicleDto } from "./db/update-vehicle.dto";
import { JwtAuthGuard } from "@/common";

@UseGuards(JwtAuthGuard)
@Controller("vehicles")
@UseGuards(JwtAuthGuard)
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Post()
    create(@Req() req, @Body() dto: CreateVehicleDto) {
        return this.vehiclesService.create(req.user.id, dto);
    }

    @Get("my")
    findMyVehicles(@Req() req) {
        return this.vehiclesService.findByUser(req.user.id);
    }

    @Patch(":id")
    update(
        @Req() req,
        @Param("id") id: string,
        @Body() dto: UpdateVehicleDto,
    ) {
        return this.vehiclesService.update(id, req.user.id, dto);
    }

    @Delete(":id")
    remove(@Req() req, @Param("id") id: string) {
        return this.vehiclesService.delete(id, req.user.id);
    }
}
