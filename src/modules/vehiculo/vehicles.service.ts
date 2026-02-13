import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Vehicle } from "../vehiculo/entities/vehicle.entity";
import { CreateVehicleDto } from "./db/create-vehicle.dto";
import { UpdateVehicleDto } from "./db/update-vehicle.dto";

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) { }

  /**
   * Formatea la placa al formato ecuatoriano ABC-1234
   * Convierte a mayúsculas y agrega el guion si no existe
   */
  private formatPlateNumber(plate: string): string {
    // Remover espacios y convertir a mayúsculas
    let formatted = plate.trim().toUpperCase().replace(/\s/g, '');

    // Si no tiene guion, intentar agregarlo (por si el usuario escribió ABC1234)
    if (!formatted.includes('-') && formatted.length === 7) {
      formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
    }

    return formatted;
  }

  /**
   * Valida el formato de placa ecuatoriana
   */
  private validatePlateFormat(plate: string): boolean {
    const plateRegex = /^[A-Z]{3}-\d{4}$/;
    return plateRegex.test(plate);
  }

  async create(userId: string, dto: CreateVehicleDto) {
    // Formatear la placa
    const formattedPlate = this.formatPlateNumber(dto.plate_number);

    // Validar formato (doble verificación)
    if (!this.validatePlateFormat(formattedPlate)) {
      throw new BadRequestException(
        "La placa debe tener el formato ABC-1234 (3 letras, guion, 4 números)"
      );
    }

    // Validar placa duplicada globalmente
    const exists = await this.vehicleRepo.findOne({
      where: { plate_number: formattedPlate },
    });

    if (exists) {
      throw new BadRequestException(
        `La placa ${formattedPlate} ya está registrada en el sistema`
      );
    }

    // Si es activo → desmarcar los otros del usuario
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

  async update(vehicle_id: string, userId: string, dto: UpdateVehicleDto) {
    // Verificar que el vehículo existe y pertenece al usuario
    const vehicle = await this.vehicleRepo.findOne({
      where: { vehicle_id, user_id: userId },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehículo no encontrado o no tienes permiso para editarlo");
    }

    // Si se intenta cambiar la placa
    if (dto.plate_number) {
      const formattedPlate = this.formatPlateNumber(dto.plate_number);

      // Validar formato
      if (!this.validatePlateFormat(formattedPlate)) {
        throw new BadRequestException(
          "La placa debe tener el formato ABC-1234 (3 letras, guion, 4 números)"
        );
      }

      // Si cambió la placa, validar que no exista
      if (formattedPlate !== vehicle.plate_number) {
        const plateExists = await this.vehicleRepo.findOne({
          where: {
            plate_number: formattedPlate,
            vehicle_id: Not(vehicle_id)
          },
        });

        if (plateExists) {
          throw new BadRequestException(
            `La placa ${formattedPlate} ya está registrada en el sistema`
          );
        }

        dto.plate_number = formattedPlate;
      }
    }

    // Si se marca como activo → desactivar los demás del usuario
    if (dto.is_active) {
      await this.vehicleRepo.update(
        { user_id: userId, vehicle_id: Not(vehicle_id) },
        { is_active: false }
      );
    }

    // Aplicar cambios
    Object.assign(vehicle, dto);
    return this.vehicleRepo.save(vehicle);
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

  async delete(vehicle_id: string, userId: string) {
    const result = await this.vehicleRepo.delete({
      vehicle_id,
      user_id: userId
    });

    if (result.affected === 0) {
      throw new NotFoundException("Vehículo no encontrado o no tienes permiso para eliminarlo");
    }

    return { message: "Vehículo eliminado correctamente" };
  }
}