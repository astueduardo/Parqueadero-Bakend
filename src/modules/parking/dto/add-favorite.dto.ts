import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddFavoriteDto {
    @IsUUID()
    @IsNotEmpty()
    parking_lot_id: string;
}
