import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetRoleDto } from './dto/set-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string): Promise<User> {
        const user = await this.usersService.findOne(id);
        if (!user) throw new NotFoundException();
        return user;
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() userData: CreateUserDto): Promise<User> {
        return this.usersService.create(userData as Partial<User>);
    }

    @Patch(':id/role')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async setRole(@Param('id') id: string, @Body() body: SetRoleDto) {
        return this.usersService.update(id, { role_id: body.role_id } as Partial<User>);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    async updateMyProfile(@Req() req: any, @Body() data: UpdateUserDto) {
        const userId = req.user.id; // siempre viene del JWT
        return this.usersService.update(userId, {
            name: data.name,
            username: data.username,
        } as Partial<User>);
    }

    @Patch('me/avatar')
    @UseGuards(JwtAuthGuard)
    async updateAvatar(@Req() req: any, @Body() body: { avatar_url: string }) {
        return this.usersService.update(req.user.id, {
            avatar_url: body.avatar_url,
        } as Partial<User>);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'gestor')
    async update(@Param('id') id: string, @Body() data: UpdateUserDto): Promise<User> {
        return this.usersService.update(id, data as Partial<User>);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async remove(@Param('id') id: string) {
        await this.usersService.remove(id);
        return { success: true };
    }

}
