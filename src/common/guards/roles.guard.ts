// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UsersService } from '../../modules/users/users.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private usersService: UsersService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const userPayload: any = (request as any).user;

        console.log('🔒 RolesGuard - User payload:', userPayload);
        console.log('🔒 RolesGuard - Required roles:', requiredRoles);

        const userId = userPayload?.id || userPayload?.sub; // Cambié aquí

        if (!userId) {
            console.error('❌ No se encontró userId en el payload');
            throw new ForbiddenException('No autorizado');
        }

        const user = await this.usersService.findOne(userId);
        if (!user) {
            console.error('❌ Usuario no encontrado:', userId);
            throw new ForbiddenException('Usuario no encontrado');
        }

        if (!user.role) {
            console.error('❌ Usuario sin rol asignado');
            return false;
        }

        const hasRole = requiredRoles.includes(user.role);
        console.log(`${hasRole ? '✅' : '❌'} Usuario tiene rol requerido:`, user.role);

        return hasRole;
    }
}