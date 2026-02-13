import { IsUUID, IsNotEmpty, IsIn } from 'class-validator';

export class ValidateQrDto {
    @IsUUID()
    @IsNotEmpty()
    reservation_id: string;

    @IsIn(['ENTRY', 'EXIT'])
    scan_type: 'ENTRY' | 'EXIT';
}
