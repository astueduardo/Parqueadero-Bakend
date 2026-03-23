import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateRoleDto {
    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}