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
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './db/create-vehicle.dto';
import { UpdateVehicleDto } from './db/update-vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('vehicles')
@UseGuards(JwtAuthGuard) // Asegura que todas las rutas requieran autenticación
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    // ✅ Obtener todos los vehículos del usuario
    @Get('my')
    async getMyVehicles(@Request() req) {
        const userId = req.user.user_id || req.user.id; // Ajusta según tu estructura JWT
        return this.vehiclesService.findByUser(userId);
    }

    // ✅ Obtener un vehículo específico
    @Get(':vehicle_id')
    async getOne(@Param('vehicle_id') vehicle_id: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.vehiclesService.findOne(vehicle_id, userId);
    }

    // ✅ Crear vehículo
    @Post()
    async create(@Body() dto: CreateVehicleDto, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        console.log('📝 Creando vehículo para usuario:', userId);
        console.log('📝 Datos:', dto);
        return this.vehiclesService.create(userId, dto);
    }

    // ✅ ACTUALIZAR VEHÍCULO - CORREGIDO
    @Patch(':vehicle_id')
    async update(
        @Param('vehicle_id') vehicle_id: string,
        @Body() dto: UpdateVehicleDto,
        @Request() req,
    ) {
        const userId = req.user.user_id || req.user.id;

        console.log('🔧 Actualizando vehículo:');
        console.log('  vehicle_id:', vehicle_id);
        console.log('  userId:', userId);
        console.log('  datos:', dto);

        return this.vehiclesService.update(vehicle_id, userId, dto);
    }

    // ✅ ELIMINAR VEHÍCULO - CORREGIDO
    @Delete(':vehicle_id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('vehicle_id') vehicle_id: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;

        console.log('🗑️  DELETE request recibida:');
        console.log('  vehicle_id (param):', vehicle_id);
        console.log('  vehicle_id tipo:', typeof vehicle_id);
        console.log('  userId:', userId);
        console.log('  userId tipo:', typeof userId);

        return this.vehiclesService.delete(vehicle_id, userId);
    }
}