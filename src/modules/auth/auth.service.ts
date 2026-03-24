import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { UsersService } from "../users/users.service";
import { RateLimitService } from "./rate-limit.service";
import { User } from "../users/entities/user.entity";
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private rateLimitService: RateLimitService,
    private auditLogService: AuditLogService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // ===============================
  // REGISTRO NORMAL
  // ===============================
  async register(registerDto: RegisterDto) {
    const { name, email, password, confirmPassword } = registerDto;

    if (password !== confirmPassword) {
      throw new BadRequestException("Las contraseñas no coinciden");
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException("El email ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      auth_provider: "local",
      googleId: null,
      role_id: "00000000-0000-0000-0000-000000000004",
    } as Partial<User>);

    await this.auditLogService.log('REGISTER', user.id, `Nuevo usuario: ${email}`);

    return this.generateToken(user);

  }

  // ===============================
  // LOGIN NORMAL
  // ===============================
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 1. Verificar si está bloqueado
    if (await this.rateLimitService.isRateLimited(email)) {
      throw new UnauthorizedException(
        "Demasiados intentos fallidos. Intenta en 15 minutos.",
      );
    }

    // 2. Buscar usuario
    const user = await this.usersService.findByEmail(email);
    if (!user || user.auth_provider !== "local") {
      await this.rateLimitService.recordAttempt(email);
      const remaining = await this.rateLimitService.getAttemptsRemaining(email);
      throw new UnauthorizedException(
        `Credenciales inválidas. (${remaining} intentos restantes)`,
      );
    }

    // 3. Verificar contraseña
    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) {
      await this.rateLimitService.recordAttempt(email);
      const remaining = await this.rateLimitService.getAttemptsRemaining(email);
      throw new UnauthorizedException(
        `Credenciales inválidas. (${remaining} intentos restantes)`,
      );
    }

    await this.auditLogService.log('LOGIN', user.id, `Login: ${email}`);
    return this.generateToken(user);

  }

  // ===============================
  // LOGIN GOOGLE (MÓVIL)
  // ===============================
  async googleLoginWithToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: [
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_ID_IOS!,
        process.env.GOOGLE_CLIENT_ANDROID!,
      ] as string[],
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedException("Token Google inválido");
    }

    let user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      user = await this.usersService.create({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        password: null,
        auth_provider: "google",
        role_id: "00000000-0000-0000-0000-000000000004",
        avatar_url: payload.picture || null,
      });
    }
    else if (!user.avatar_url && payload.picture) {
      // Si ya existe pero sin foto → actualizar
      await this.usersService.update(user.id, { avatar_url: payload.picture } as any);
      user = await this.usersService.findOne(user.id) as User;
    }


    await this.auditLogService.log('LOGIN_GOOGLE', user.id, `Google login: ${user.email}`);
    return this.generateToken(user);
  }

  // ===============================
  // JWT
  // ===============================
  private async generateToken(user: User) {
    const roleEntity = await this.usersService.findOneWithRole(user.id);
    const roleName = roleEntity?.roleEntity?.name || 'user';

    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role_id: user.role_id,
        role: roleName,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        auth_provider: user.auth_provider,
        role_id: user.role_id,
        createdAt: user.created_at,
        role: roleName,
      },
    };
  }
}