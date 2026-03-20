// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        console.log('🔐 JWT Payload recibido:', payload);
        console.log('🕐 Token expira en:', new Date(payload.exp * 1000));
        console.log('🕐 Hora actual:', new Date());

        const user = await this.usersService.findOne(payload.sub);

        if (!user) {
            console.error('❌ Usuario no encontrado con ID:', payload.sub);
            throw new UnauthorizedException('Usuario no encontrado');
        }

        console.log('✅ Usuario validado:', user.email);

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
}