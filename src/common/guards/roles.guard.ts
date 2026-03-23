import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesService } from '../../modules/roles/roles.service';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...perms: string[]) =>
    Reflect.metadata(PERMISSIONS_KEY, perms);

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private rolesService: RolesService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(), context.getClass(),
        ]);

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(), context.getClass(),
        ]);

        // Sin restricciones → acceso libre
        if (!requiredRoles?.length && !requiredPermissions?.length) return true;

        const user = context.switchToHttp().getRequest().user;
        if (!user) throw new ForbiddenException('No autorizado');

        // Verificar por nombre de rol (compatibilidad con @Roles existente)
        if (requiredRoles?.length) {
            const role = await this.rolesService.findOneRole(user.role_id).catch(() => null);
            if (!role) throw new ForbiddenException('Rol no encontrado');
            if (requiredRoles.includes(role.name)) return true;
        }

        // Verificar por permiso granular
        if (requiredPermissions?.length) {
            const checks = await Promise.all(
                requiredPermissions.map((p) => this.rolesService.hasPermission(user.role_id, p))
            );
            if (checks.every(Boolean)) return true;
        }

        throw new ForbiddenException('No tienes permisos suficientes');
    }
}