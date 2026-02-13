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

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private rateLimitService: RateLimitService
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
      role: "user",
    } as Partial<User>);

    return this.generateToken(user);
  }

  // ===============================
  // LOGIN NORMAL
  // ===============================
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Verificar rate limit
    if (this.rateLimitService.isRateLimited(email)) {
      throw new UnauthorizedException(
        "Demasiados intentos fallidos. Intenta en 15 minutos.",
      );
    }

    const user = await this.usersService.findByEmail(email);
    if (!user || user.auth_provider !== "local") {
      this.rateLimitService.recordAttempt(email);
      const remaining = this.rateLimitService.getAttemptsRemaining(email);
      throw new UnauthorizedException(
        `Credenciales inválidas. (${remaining} intentos restantes)`,
      );
    }

    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) {
      this.rateLimitService.recordAttempt(email);
      const remaining = this.rateLimitService.getAttemptsRemaining(email);
      throw new UnauthorizedException(
        `Credenciales inválidas. (${remaining} intentos restantes)`,
      );
    }

    // Login exitoso, resetear intentos
    this.rateLimitService.resetAttempts(email);

    return this.generateToken(user);
  }

  // ===============================
  // LOGIN GOOGLE (MÓVIL)
  // ===============================
  async googleLoginWithToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
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
      });
    }

    return this.generateToken(user);
  }

  // ===============================
  // LOGIN GOOGLE (WEB - Passport Strategy)
  // ===============================
  async googleLoginFromProfile(profile: {
    googleId: string;
    email: string;
    name: string;
  }) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        name: profile.name,
        googleId: profile.googleId,
        password: null,
        auth_provider: "google",
      });
    }

    return this.generateToken(user);
  }

  // ===============================
  // JWT
  // ===============================
  private generateToken(user: User) {
    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        auth_provider: user.auth_provider,
        role: user.role,
      },
    };
  }
}
