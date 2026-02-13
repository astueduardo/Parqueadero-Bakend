import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ParkingLot } from "../entities/parking-Lot.entity";
import { ParkingLotResponseDto } from "../dto/parking-lot-response.dto";

@Injectable()
export class ParkingLotsService {
  constructor(
    @InjectRepository(ParkingLot)
    private readonly lotRepo: Repository<ParkingLot>,
  ) { }

  async findAll(): Promise<ParkingLotResponseDto[]> {
    const lots = await this.lotRepo.find();

    return lots.map((lot) => ({
      id: lot.id,
      name: lot.name,
      address: lot.address,
      available: Number(lot.available_spaces),
      total: lot.total_spaces,
      price: Number(lot.price),
      rating: lot.rating,
      tags: ["covered", "24/7"],
      isFavorite: false,
    }));
  }
}
