import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { RateLimitService } from './rate-limit.service';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        forwardRef(() => UsersModule),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '24h' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
        AuthService,
        JwtAuthGuard,
        JwtStrategy,
        RolesGuard,
        GoogleStrategy,
        RateLimitService,
    ],
    controllers: [AuthController],
    exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, RateLimitService],
})
export class AuthModule { }
