import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class SaveTokenDto {
    @IsString()
    @IsNotEmpty()
    token!: string;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    // Frontend llama esto al abrir la app
    @Post('token')
    saveToken(@Body() dto: SaveTokenDto, @Request() req) {
        return this.notificationsService.savePushToken(req.user.id, dto.token);
    }
}