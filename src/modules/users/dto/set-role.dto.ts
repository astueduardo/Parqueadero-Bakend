import { IsNotEmpty, IsString } from 'class-validator';

export class SetRoleDto {
    @IsNotEmpty()
    @IsString()
    role: string;
}
