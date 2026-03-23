import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
    @IsUUID()
    @IsNotEmpty()
    reservation_id!: string;
}