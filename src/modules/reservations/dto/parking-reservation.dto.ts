import { IsUUID, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class ParkingReservationDto {
    @IsUUID()
    @IsNotEmpty()
    space_id: string;

    @IsOptional()
    @IsUUID()
    vehicle_id?: string;

    @IsDateString()
    @IsNotEmpty()
    start_time: string;

    @IsDateString()
    @IsNotEmpty()
    end_time: string;
}

