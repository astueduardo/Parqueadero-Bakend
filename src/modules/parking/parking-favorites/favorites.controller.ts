import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { FavoritesService } from "../parking-favorites/favorites.service";
import { JwtAuthGuard } from "../../../common/guards/jwt-auth.guard";

@Controller("favorites")
@UseGuards(JwtAuthGuard) // todas las rutas requieren auth
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    // Mis favoritos
    @Get()
    getMyFavorites(@Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.favoritesService.getMyFavorites(userId);
    }

    // Verificar si un parqueadero es favorito
    @Get(":parkingLotId/check")
    isFavorite(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.favoritesService.isFavorite(userId, parkingLotId);
    }

    // Toggle: agrega o quita según estado actual (el más útil para el móvil)
    @Post(":parkingLotId/toggle")
    toggle(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.favoritesService.toggleFavorite(userId, parkingLotId);
    }

    // Agregar a favoritos
    @Post(":parkingLotId")
    add(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.favoritesService.addFavorite(userId, parkingLotId);
    }

    // Quitar de favoritos
    @Delete(":parkingLotId")
    @HttpCode(HttpStatus.OK)
    remove(@Param("parkingLotId") parkingLotId: string, @Request() req) {
        const userId = req.user.user_id || req.user.id;
        return this.favoritesService.removeFavorite(userId, parkingLotId);
    }
}