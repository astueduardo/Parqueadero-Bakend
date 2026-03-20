import {
    Injectable,
    NotFoundException,
    ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Favorite } from "./entities/favorite.entity";

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepo: Repository<Favorite>,
    ) { }

    // Obtener todos los favoritos del usuario
    async getMyFavorites(userId: string): Promise<Favorite[]> {
        return this.favoriteRepo.find({
            where: { userId },
            relations: ["parkingLot"],
            order: { createdAt: "DESC" },
        });
    }

    // Verificar si un parqueadero es favorito
    async isFavorite(userId: string, parkingLotId: string): Promise<{ isFavorite: boolean }> {
        const favorite = await this.favoriteRepo.findOne({
            where: { userId, parkingLotId },
        });
        return { isFavorite: !!favorite };
    }

    // Agregar a favoritos
    async addFavorite(userId: string, parkingLotId: string): Promise<Favorite> {
        const exists = await this.favoriteRepo.findOne({
            where: { userId, parkingLotId },
        });

        if (exists) {
            throw new ConflictException("Este parqueadero ya está en tus favoritos");
        }

        const favorite = this.favoriteRepo.create({ userId, parkingLotId });
        return this.favoriteRepo.save(favorite);
    }

    // Quitar de favoritos
    async removeFavorite(userId: string, parkingLotId: string): Promise<{ message: string }> {
        const favorite = await this.favoriteRepo.findOne({
            where: { userId, parkingLotId },
        });

        if (!favorite) {
            throw new NotFoundException("Este parqueadero no está en tus favoritos");
        }

        await this.favoriteRepo.remove(favorite);
        return { message: "Eliminado de favoritos correctamente" };
    }

    // Toggle: si existe lo quita, si no existe lo agrega
    async toggleFavorite(userId: string, parkingLotId: string): Promise<{ isFavorite: boolean; message: string }> {
        const existing = await this.favoriteRepo.findOne({
            where: { userId, parkingLotId },
        });

        if (existing) {
            await this.favoriteRepo.remove(existing);
            return { isFavorite: false, message: "Eliminado de favoritos" };
        }

        const favorite = this.favoriteRepo.create({ userId, parkingLotId });
        await this.favoriteRepo.save(favorite);
        return { isFavorite: true, message: "Agregado a favoritos" };
    }
}