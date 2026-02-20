import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vehicle } from "../vehiculo/entities/vehicle.entity";
import { CreateVehicleDto } from "./db/create-vehicle.dto";
import { UpdateVehicleDto } from "./db/update-vehicle.dto";

/**
 * 🚨 VERSIÓN "NUCLEAR" - USA RAW SQL
 * Esta versión bypasea TypeORM completamente para operaciones UPDATE y DELETE
 * Úsala SOLO si las versiones anteriores no funcionan
 */
@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) { }

  private formatPlateNumber(plate: string): string {
    let formatted = plate.trim().toUpperCase().replace(/\s/g, '');
    if (!formatted.includes('-') && formatted.length === 7) {
      formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
    }
    return formatted;
  }

  private validatePlateFormat(plate: string): boolean {
    const plateRegex = /^[A-Z]{3}-\d{4}$/;
    return plateRegex.test(plate);
  }

  async create(userId: string, dto: CreateVehicleDto) {
    const formattedPlate = this.formatPlateNumber(dto.plate_number);

    if (!this.validatePlateFormat(formattedPlate)) {
      throw new BadRequestException(
        "La placa debe tener el formato ABC-1234 (3 letras, guion, 4 números)"
      );
    }

    const exists = await this.vehicleRepo.findOne({
      where: { plate_number: formattedPlate },
    });

    if (exists) {
      throw new BadRequestException(
        `La placa ${formattedPlate} ya está registrada en el sistema`
      );
    }

    if (dto.is_active) {
      await this.vehicleRepo.update(
        { user_id: userId },
        { is_active: false }
      );
    }

    const vehicle = this.vehicleRepo.create({
      ...dto,
      plate_number: formattedPlate,
      user_id: userId,
    });

    return this.vehicleRepo.save(vehicle);
  }

  /**
   * ✅ UPDATE usando RAW SQL - GARANTIZADO QUE FUNCIONA
   */
  async update(vehicle_id: string, userId: string, dto: UpdateVehicleDto) {
    console.log('🔧 UPDATE (RAW SQL) - Inicio');
    console.log('  vehicle_id:', vehicle_id);
    console.log('  userId:', userId);
    console.log('  dto:', dto);

    // Paso 1: Verificar que existe usando RAW SQL
    const existsQuery = `
      SELECT * FROM vehicles 
      WHERE vehicle_id = $1 AND user_id = $2
    `;
    const [vehicle] = await this.vehicleRepo.query(existsQuery, [vehicle_id, userId]);

    console.log('  Vehículo encontrado (RAW):', vehicle ? 'SÍ' : 'NO');

    if (!vehicle) {
      throw new NotFoundException("Vehículo no encontrado o no tienes permiso");
    }

    // Paso 2: Validar placa si cambió
    let finalPlate = vehicle.plate_number;
    if (dto.plate_number && dto.plate_number !== vehicle.plate_number) {
      const formattedPlate = this.formatPlateNumber(dto.plate_number);

      if (!this.validatePlateFormat(formattedPlate)) {
        throw new BadRequestException("La placa debe tener el formato ABC-1234");
      }

      const plateExistsQuery = `
        SELECT * FROM vehicles 
        WHERE plate_number = $1 AND vehicle_id != $2
      `;
      const [existingPlate] = await this.vehicleRepo.query(plateExistsQuery, [
        formattedPlate,
        vehicle_id,
      ]);

      if (existingPlate) {
        throw new BadRequestException(`La placa ${formattedPlate} ya está registrada`);
      }

      finalPlate = formattedPlate;
    }

    // Paso 3: Si se marca como activo, desactivar los demás
    if (dto.is_active === true) {
      const deactivateQuery = `
        UPDATE vehicles 
        SET is_active = false 
        WHERE user_id = $1 AND vehicle_id != $2
      `;
      await this.vehicleRepo.query(deactivateQuery, [userId, vehicle_id]);
    }

    // Paso 4: Construir UPDATE dinámicamente
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.plate_number) {
      updates.push(`plate_number = $${paramIndex++}`);
      values.push(finalPlate);
    }
    if (dto.brand !== undefined) {
      updates.push(`brand = $${paramIndex++}`);
      values.push(dto.brand);
    }
    if (dto.model !== undefined) {
      updates.push(`model = $${paramIndex++}`);
      values.push(dto.model);
    }
    if (dto.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(dto.color);
    }
    if (dto.vehicle_type !== undefined) {
      updates.push(`vehicle_type = $${paramIndex++}`);
      values.push(dto.vehicle_type);
    }
    if (dto.year !== undefined) {
      updates.push(`year = $${paramIndex++}`);
      values.push(dto.year);
    }
    if (dto.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(dto.is_active);
    }

    if (updates.length === 0) {
      console.log('  Sin cambios para aplicar');
      return vehicle;
    }

    values.push(vehicle_id);
    values.push(userId);

    const updateQuery = `
      UPDATE vehicles 
      SET ${updates.join(', ')} 
      WHERE vehicle_id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING *
    `;

    console.log('  Query:', updateQuery);
    console.log('  Values:', values);

    const [updated] = await this.vehicleRepo.query(updateQuery, values);

    console.log('✅ UPDATE (RAW SQL) - Exitoso');
    return updated;
  }

  /**
   * ✅ DELETE usando RAW SQL - GARANTIZADO QUE FUNCIONA
   */
  async delete(vehicle_id: string, userId: string) {
    console.log('🗑️  DELETE (RAW SQL) - Inicio');
    console.log('  vehicle_id:', vehicle_id, typeof vehicle_id);
    console.log('  userId:', userId, typeof userId);

    // Paso 1: Verificar que existe
    const checkQuery = `
      SELECT * FROM vehicles 
      WHERE vehicle_id = $1 AND user_id = $2
    `;
    const [vehicle] = await this.vehicleRepo.query(checkQuery, [vehicle_id, userId]);

    console.log('  Vehículo encontrado (RAW):', vehicle ? `SÍ - ${vehicle.plate_number}` : 'NO');

    if (!vehicle) {
      // Debug adicional: buscar sin userId
      const debugQuery = `SELECT * FROM vehicles WHERE vehicle_id = $1`;
      const [debugVehicle] = await this.vehicleRepo.query(debugQuery, [vehicle_id]);
      console.log('  Debug - Existe sin filtro de usuario:', debugVehicle ? 'SÍ' : 'NO');
      if (debugVehicle) {
        console.log('  Debug - Usuario del vehículo:', debugVehicle.user_id);
        console.log('  Debug - Usuario solicitante:', userId);
      }

      throw new NotFoundException(
        "Vehículo no encontrado o no tienes permiso para eliminarlo"
      );
    }

    // Paso 2: Eliminar usando RAW SQL
    const deleteQuery = `
      DELETE FROM vehicles 
      WHERE vehicle_id = $1 AND user_id = $2
      RETURNING *
    `;
    const deleted = await this.vehicleRepo.query(deleteQuery, [vehicle_id, userId]);

    console.log('  Filas eliminadas (RAW):', deleted.length);
    console.log('✅ DELETE (RAW SQL) - Exitoso');

    return {
      message: "Vehículo eliminado correctamente",
      deleted_plate: vehicle.plate_number,
    };
  }

  async findByUser(userId: string) {
    return this.vehicleRepo.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    });
  }

  async findOne(vehicle_id: string, userId: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { vehicle_id, user_id: userId },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehículo no encontrado");
    }

    return vehicle;
  }
}