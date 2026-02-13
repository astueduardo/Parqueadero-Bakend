import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ParkingSpace } from "../entities/parking-space.entity";
import { ParkingSpaceDto } from "../dto/Parking-space.dto";

@Injectable()
export class ParkingSpacesService {
    constructor(
        @InjectRepository(ParkingSpace)
        private readonly spaceRepo: Repository<ParkingSpace>,
    ) { }
    async findAll(): Promise<ParkingSpaceDto[]> {
        const spaces = await this.spaceRepo.find();
        return spaces.map((space) => ({
            id: space.id,
            code: space.code,
            type: space.type,
            is_active: space.is_active,
            lot_id: space.lot.id,
        }));
    }
}