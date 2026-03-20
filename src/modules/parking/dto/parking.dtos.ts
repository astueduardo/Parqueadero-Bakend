import { IsString, IsInt, IsNumber, IsOptional, IsBoolean, IsUUID, Min, Max, Length } from "class-validator";

// ─── PARKING LOT ───────────────────────────────────────────

export class CreateParkingLotDto {
    @IsString()
    @Length(3, 120)
    name!: string;

    @IsString()
    @Length(5, 200)
    address!: string;

    @IsInt()
    @Min(1)
    totalSpaces!: number;

    @IsInt()
    @Min(0)
    availableSpaces!: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;
}

export class UpdateParkingLotDto {
    @IsOptional()
    @IsString()
    @Length(3, 120)
    name?: string;

    @IsOptional()
    @IsString()
    @Length(5, 200)
    address?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    totalSpaces?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    availableSpaces?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// ─── PARKING SPACE ─────────────────────────────────────────

export class CreateParkingSpaceDto {
    @IsUUID()
    lotId!: string;

    @IsString()
    @Length(1, 20)
    code!: string;

    @IsString()
    @Length(1, 20)
    type!: string; // regular | discapacitado | moto

    @IsOptional()
    @IsInt()
    @Min(1)
    floor?: number;
}

export class UpdateParkingSpaceDto {
    @IsOptional()
    @IsString()
    @Length(1, 20)
    code?: string;

    @IsOptional()
    @IsString()
    @Length(1, 20)
    type?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    floor?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}