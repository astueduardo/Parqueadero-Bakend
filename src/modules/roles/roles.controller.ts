import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    findAll() {
        return this.rolesService.findAllRoles();
    }

    @Get('permissions')
    findAllPermissions() {
        return this.rolesService.findAllPermissions();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOneRole(id);
    }

    @Post()
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.createRole(dto);
    }

    @Patch(':id/permissions')
    assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
        return this.rolesService.assignPermissions(id, dto);
    }

    @Patch(':id/toggle')
    toggle(@Param('id') id: string) {
        return this.rolesService.toggleActive(id);
    }
}