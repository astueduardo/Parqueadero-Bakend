import { Controller, Post, Delete, Get, Param, UseGuards, Req, Body } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AddFavoriteDto } from '../dto/add-favorite.dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Post()
    async addFavorite(@Req() req: any, @Body() body: AddFavoriteDto) {
        return this.favoritesService.addFavorite(req.user.id, body.parking_lot_id);
    }

    @Get()
    async getFavorites(@Req() req: any) {
        return this.favoritesService.getFavorites(req.user.id);
    }

    @Delete(':parkingLotId')
    async removeFavorite(
        @Req() req: any,
        @Param('parkingLotId') parkingLotId: string,
    ) {
        await this.favoritesService.removeFavorite(req.user.id, parkingLotId);
        return { success: true };
    }

    @Get('check/:parkingLotId')
    async isFavorite(
        @Req() req: any,
        @Param('parkingLotId') parkingLotId: string,
    ) {
        const isFav = await this.favoritesService.isFavorite(
            req.user.id,
            parkingLotId,
        );
        return { isFavorite: isFav };
    }
}
