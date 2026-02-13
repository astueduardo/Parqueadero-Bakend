import {
    IsString,
    IsOptional,
    IsInt,
    Min,
    Max,
    IsNotEmpty,
    Length,
    IsBoolean,
    Matches
} from "class-validator";

export class CreateVehicleDto {
    @IsString()
    @IsNotEmpty({ message: "La placa es obligatoria" })
    @Matches(/^[A-Z]{3}-\d{4}$/, {
        message: "La placa debe tener el formato ABC-1234 (3 letras mayúsculas, guion, 4 números)"
    })
    plate_number: string;

    @IsString()
    @IsNotEmpty({ message: "La marca es obligatoria" })
    @Length(2, 50, { message: "La marca debe tener entre 2 y 50 caracteres" })
    brand: string;

    @IsString()
    @IsOptional()
    @Length(2, 50, { message: "El modelo debe tener entre 2 y 50 caracteres" })
    model?: string;

    @IsString()
    @IsNotEmpty({ message: "El color es obligatorio" })
    @Length(3, 30, { message: "El color debe tener entre 3 y 30 caracteres" })
    color: string;

    @IsString()
    @IsNotEmpty({ message: "El tipo de vehículo es obligatorio" })
    @Length(3, 20, { message: "El tipo debe tener entre 3 y 20 caracteres" })
    vehicle_type: string;

    @IsInt({ message: "El año debe ser un número entero" })
    @IsOptional()
    @Min(1900, { message: "El año debe ser mayor a 1900" })
    @Max(new Date().getFullYear() + 1, { message: "El año no puede ser futuro" })
    year?: number;

    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}