import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RateLimitService } from './rate-limit.service';
import { LoginAttempt } from './entities/login-attempt.entity';
import { AuditLogModule } from '../audit/audit-log.module';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        forwardRef(() => UsersModule),
        AuditLogModule,  // ← agregar
        RolesModule,     // ← agregar
        TypeOrmModule.forFeature([LoginAttempt]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '30D' },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtAuthGuard, JwtStrategy, RolesGuard, RateLimitService],
    controllers: [AuthController],
    exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule, RateLimitService],
})
export class AuthModule { }