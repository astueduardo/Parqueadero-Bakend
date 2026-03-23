import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vehicle } from "./entities/vehicle.entity";
import { CreateVehicleDto } from "./db/create-vehicle.dto";
import { UpdateVehicleDto } from "./db/update-vehicle.dto";

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
    return /^[A-Z]{3}-\d{4}$/.test(plate);
  }

  async create(userId: string, dto: CreateVehicleDto) {
    const formattedPlate = this.formatPlateNumber(dto.plate_number);

    if (!this.validatePlateFormat(formattedPlate)) {
      throw new BadRequestException(
        "La placa debe tener el formato ABC-1234"
      );
    }

    const exists = await this.vehicleRepo.findOne({
      where: { plate_number: formattedPlate },
    });
    if (exists) {
      throw new BadRequestException(
        `La placa ${formattedPlate} ya está registrada`
      );
    }

    if (dto.is_active) {
      await this.vehicleRepo.update({ user_id: userId }, { is_active: false });
    }

    const vehicle = this.vehicleRepo.create({
      ...dto,
      plate_number: formattedPlate,
      user_id: userId,
    });

    return this.vehicleRepo.save(vehicle);
  }

  async update(vehicle_id: string, userId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { vehicle_id, user_id: userId },
    });

    if (!vehicle) {
      throw new NotFoundException("Vehículo no encontrado o no tienes permiso");
    }

    // Validar placa si cambió
    if (dto.plate_number && dto.plate_number !== vehicle.plate_number) {
      const formattedPlate = this.formatPlateNumber(dto.plate_number);

      if (!this.validatePlateFormat(formattedPlate)) {
        throw new BadRequestException("La placa debe tener el formato ABC-1234");
      }

      const plateExists = await this.vehicleRepo.findOne({
        where: { plate_number: formattedPlate },
      });
      if (plateExists && plateExists.vehicle_id !== vehicle_id) {
        throw new BadRequestException(`La placa ${formattedPlate} ya está registrada`);
      }

      dto.plate_number = formattedPlate;
    }

    // Si se marca como activo, desactivar los demás
    if (dto.is_active === true) {
      await this.vehicleRepo.update(
        { user_id: userId },
        { is_active: false },
      );
    }

    Object.assign(vehicle, dto);
    return this.vehicleRepo.save(vehicle);
  }

  async delete(vehicle_id: string, userId: string) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { vehicle_id, user_id: userId },
    });

    if (!vehicle) {
      throw new NotFoundException(
        "Vehículo no encontrado o no tienes permiso para eliminarlo"
      );
    }

    await this.vehicleRepo.remove(vehicle);

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