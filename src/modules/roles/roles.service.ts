import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>,
    ) { }

    // ── Roles ────────────────────────────────────

    async findAllRoles(): Promise<Role[]> {
        return this.roleRepo.find({
            where: { is_active: true },
            relations: ['permissions'],
        });
    }

    async findOneRole(id: string): Promise<Role> {
        const role = await this.roleRepo.findOne({
            where: { id },
            relations: ['permissions'],
        });

        if (!role) {
            throw new NotFoundException(`Rol ${id} no encontrado`);
        }

        return role;
    }

    async createRole(dto: CreateRoleDto): Promise<Role> {
        const exists = await this.roleRepo.findOne({
            where: { name: dto.name },
        });

        if (exists) {
            throw new ConflictException(`El rol "${dto.name}" ya existe`);
        }

        const role = this.roleRepo.create(dto);
        return this.roleRepo.save(role);
    }

    async toggleActive(id: string): Promise<Role> {
        const role = await this.findOneRole(id);
        role.is_active = !role.is_active;
        return this.roleRepo.save(role);
    }

    // ── Permisos ─────────────────────────────────

    async findAllPermissions(): Promise<Permission[]> {
        return this.permissionRepo.find({
            order: { resource: 'ASC', action: 'ASC' },
        });
    }

    async assignPermissions(
        roleId: string,
        dto: AssignPermissionsDto,
    ): Promise<Role> {
        const role = await this.findOneRole(roleId);

        const permissions = await this.permissionRepo.find({
            where: {
                id: In(dto.permissionIds),
            },
        });

        if (permissions.length !== dto.permissionIds.length) {
            throw new NotFoundException('Uno o más permisos no existen');
        }

        role.permissions = permissions;

        return this.roleRepo.save(role);
    }

    // ── Verificación de permisos ──────────────────

    async hasPermission(roleId: string, permission: string): Promise<boolean> {
        const role = await this.roleRepo.findOne({
            where: { id: roleId, is_active: true },
            relations: ['permissions'],
        });

        if (!role) return false;

        return role.permissions.some((p) => p.name === permission);
    }
}