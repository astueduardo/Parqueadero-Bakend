import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ParkingLot } from "./entities/parking-Lot.entity";
import { ParkingSpace } from "./entities/parking-space.entity";
import {
    CreateParkingLotDto,
    UpdateParkingLotDto,
    CreateParkingSpaceDto,
    UpdateParkingSpaceDto,
} from "./dto/parking.dtos";

@Injectable()
export class ParkingService {

    constructor(
        @InjectRepository(ParkingLot)
        private readonly lotRepo: Repository<ParkingLot>,
        @InjectRepository(ParkingSpace)
        private readonly spaceRepo: Repository<ParkingSpace>,
    ) { }

    // ═══════════════════════════════════════════════
    //  PARKING LOTS
    // ═══════════════════════════════════════════════

    // Obtener todos los parqueaderos activos (público)
    async findAllLots(): Promise<ParkingLot[]> {
        return this.lotRepo.find({
            where: { isActive: true },
            relations: ["owner"],
            order: { createdAt: "DESC" },
        });
    }
    // ─── AGREGAR ESTE MÉTODO en ParkingService ───────────────────────────────────
    // Dentro de la clase ParkingService, después de findSpacesByLot

   
    // ─── AGREGAR ESTE ENDPOINT en ParkingSpacesController ────────────────────────
    // Antes del @Get(':id')


    // Obtener parqueaderos del dueño
    async findMyLots(ownerId: string): Promise<ParkingLot[]> {
        return this.lotRepo.find({
            where: { ownerId },
            relations: ["spaces"],
            order: { createdAt: "DESC" },
        });
    }

    // Obtener un parqueadero por ID
    async findOneLot(id: string): Promise<ParkingLot> {
        const lot = await this.lotRepo.findOne({
            where: { id },
            relations: ["spaces", "owner"],
        });
        if (!lot) throw new NotFoundException(`Parqueadero ${id} no encontrado`);
        return lot;
    }

    // Crear parqueadero (solo admin/owner)
    async createLot(ownerId: string, dto: CreateParkingLotDto): Promise<ParkingLot> {
        if (dto.availableSpaces > dto.totalSpaces) {
            throw new BadRequestException("Los espacios disponibles no pueden superar el total");
        }

        const lot = this.lotRepo.create({ ...dto, ownerId });
        return this.lotRepo.save(lot);
    }

    // Actualizar parqueadero
    async updateLot(id: string, ownerId: string, dto: UpdateParkingLotDto): Promise<ParkingLot> {
        const lot = await this.findOneLot(id);

        if (lot.ownerId !== ownerId) {
            throw new ForbiddenException("No tienes permiso para editar este parqueadero");
        }

        if (dto.availableSpaces !== undefined && dto.totalSpaces !== undefined) {
            if (dto.availableSpaces > dto.totalSpaces) {
                throw new BadRequestException("Los espacios disponibles no pueden superar el total");
            }
        }

        Object.assign(lot, dto);
        return this.lotRepo.save(lot);
    }

    // Eliminar parqueadero (soft delete)
    async deleteLot(id: string, ownerId: string): Promise<{ message: string }> {
        const lot = await this.findOneLot(id);

        if (lot.ownerId !== ownerId) {
            throw new ForbiddenException("No tienes permiso para eliminar este parqueadero");
        }

        lot.isActive = false;
        await this.lotRepo.save(lot);
        return { message: `Parqueadero ${lot.name} eliminado correctamente` };
    }

    // ═══════════════════════════════════════════════
    //  PARKING SPACES
    // ═══════════════════════════════════════════════

    // Obtener todos los espacios de un parqueadero
    async findSpacesByLot(lotId: string): Promise<ParkingSpace[]> {
        await this.findOneLot(lotId); // valida que el lot exista
        return this.spaceRepo.find({
            where: { lotId },
            order: { floor: "ASC", code: "ASC" },
        });
    }

    // Obtener un espacio por ID
    async findOneSpace(id: string): Promise<ParkingSpace> {
        const space = await this.spaceRepo.findOne({ where: { id }, relations: ["lot"] });
        if (!space) throw new NotFoundException(`Espacio ${id} no encontrado`);
        return space;
    }
    // ==================== VALIDACIÓN DE PROPIEDAD ====================

    // Verifica que el usuario sea dueño del lote
    private async checkLotOwnership(lotId: string, userId: string): Promise<ParkingLot> {
        const lot = await this.findOneLot(lotId);
        if (lot.ownerId !== userId) {
            throw new ForbiddenException('No eres dueño de este parqueadero');
        }
        return lot;
    }

    // Verifica que el usuario sea dueño del espacio (a través del lote)
    private async checkSpaceOwnership(spaceId: string, userId: string): Promise<ParkingSpace> {
        const space = await this.spaceRepo.findOne({
            where: { id: spaceId },
            relations: ['lot'], // 👈 IMPORTANTE: carga el lote relacionado
        });
        if (!space) {
            throw new NotFoundException(`Espacio ${spaceId} no encontrado`);
        }
        if (space.lot.ownerId !== userId) {
            throw new ForbiddenException('No tienes permiso para modificar este espacio');
        }
        return space;
    }

    // ==================== MÉTODOS DE ESPACIOS CON VALIDACIÓN ====================

    // CREAR ESPACIO (verifica propiedad del lote)
    async createSpace(userId: string, dto: CreateParkingSpaceDto): Promise<ParkingSpace> {
        // 1. Verificar que el lote existe y pertenece al usuario
        await this.checkLotOwnership(dto.lotId, userId);

        // 2. Verificar código duplicado
        const exists = await this.spaceRepo.findOne({
            where: { lotId: dto.lotId, code: dto.code },
        });
        if (exists) {
            throw new BadRequestException(`Ya existe un espacio con código ${dto.code} en este parqueadero`);
        }

        // 3. Crear espacio
        const space = this.spaceRepo.create(dto);
        const saved = await this.spaceRepo.save(space);

        // 4. Actualizar contadores del lote
        await this.lotRepo.increment({ id: dto.lotId }, "totalSpaces", 1);
        await this.lotRepo.increment({ id: dto.lotId }, "availableSpaces", 1);

        return saved;
    }

    // ACTUALIZAR ESPACIO
    async updateSpace(id: string, userId: string, dto: UpdateParkingSpaceDto): Promise<ParkingSpace> {
        const space = await this.checkSpaceOwnership(id, userId);
        Object.assign(space, dto);
        return this.spaceRepo.save(space);
    }

    // ELIMINAR ESPACIO
    async deleteSpace(id: string, userId: string): Promise<{ message: string }> {
        const space = await this.checkSpaceOwnership(id, userId);
        await this.spaceRepo.remove(space);

        // Actualizar contadores del lote
        await this.lotRepo.decrement({ id: space.lotId }, "totalSpaces", 1);
        if (space.isActive) {
            await this.lotRepo.decrement({ id: space.lotId }, "availableSpaces", 1);
        }

        return { message: `Espacio ${space.code} eliminado correctamente` };
    }

}