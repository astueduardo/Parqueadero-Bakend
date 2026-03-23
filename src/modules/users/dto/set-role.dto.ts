import { IsUUID } from 'class-validator';
export class SetRoleDto {
    @IsUUID('4', { message: 'role_id debe ser un UUID válido' })
    role_id!: string;
}