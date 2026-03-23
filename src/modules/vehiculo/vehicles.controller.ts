import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './db/create-vehicle.dto';
import { UpdateVehicleDto } from './db/update-vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard)
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Get('my')
    getMyVehicles(@Request() req) {
        return this.vehiclesService.findByUser(req.user.id);
    }

    @Get(':vehicle_id')
    getOne(@Param('vehicle_id') vehicle_id: string, @Request() req) {
        return this.vehiclesService.findOne(vehicle_id, req.user.id);
    }

    @Post()
    create(@Body() dto: CreateVehicleDto, @Request() req) {
        return this.vehiclesService.create(req.user.id, dto);
    }

    @Patch(':vehicle_id')
    update(
        @Param('vehicle_id') vehicle_id: string,
        @Body() dto: UpdateVehicleDto,
        @Request() req,
    ) {
        return this.vehiclesService.update(vehicle_id, req.user.id, dto);
    }

    @Delete(':vehicle_id')
    @HttpCode(HttpStatus.OK)
    delete(@Param('vehicle_id') vehicle_id: string, @Request() req) {
        return this.vehiclesService.delete(vehicle_id, req.user.id);
    }
}