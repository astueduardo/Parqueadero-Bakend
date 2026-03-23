import {
    Controller, Get, Post, Delete,
    Param, UseGuards, Request, HttpCode, HttpStatus,
} from "@nestjs/common";
import { FavoritesService } from "../parking-favorites/favorites.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";

@Controller("favorites")
@UseGuards(JwtAuthGuard)
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Get()
    getMyFavorites(@Request() req) {
        return this.favoritesService.getMyFavorites(req.user.id);
    }

    @Get(":parkingLotId/check")
    isFavorite(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        return this.favoritesService.isFavorite(req.user.id, parkingLotId);
    }

    @Post(":parkingLotId/toggle")
    toggle(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        return this.favoritesService.toggleFavorite(req.user.id, parkingLotId);
    }

    @Post(":parkingLotId")
    add(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        return this.favoritesService.addFavorite(req.user.id, parkingLotId);
    }

    @Delete(":parkingLotId")
    @HttpCode(HttpStatus.OK)
    remove(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        return this.favoritesService.removeFavorite(req.user.id, parkingLotId);
    }
}