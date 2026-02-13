import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepo: Repository<Favorite>,
    ) { }

    async addFavorite(userId: string, parkingLotId: string): Promise<Favorite> {
        const existing = await this.favoriteRepo.findOne({
            where: { user_id: userId, parking_lot_id: parkingLotId },
        });

        if (existing) {
            throw new BadRequestException(
                'Este estacionamiento ya está en tus favoritos',
            );
        }

        const favorite = this.favoriteRepo.create({
            user_id: userId,
            parking_lot_id: parkingLotId,
        });

        return this.favoriteRepo.save(favorite);
    }

    async removeFavorite(userId: string, parkingLotId: string): Promise<void> {
        const result = await this.favoriteRepo.delete({
            user_id: userId,
            parking_lot_id: parkingLotId,
        });

        if (result.affected === 0) {
            throw new NotFoundException('Favorito no encontrado');
        }
    }

    async getFavorites(userId: string): Promise<Favorite[]> {
        return this.favoriteRepo.find({
            where: { user_id: userId },
            relations: ['parkingLot'],
            order: { created_at: 'DESC' },
        });
    }

    async isFavorite(userId: string, parkingLotId: string): Promise<boolean> {
        const favorite = await this.favoriteRepo.findOne({
            where: { user_id: userId, parking_lot_id: parkingLotId },
        });

        return !!favorite;
    }
}
