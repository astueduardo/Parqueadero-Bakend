import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('google')
    googleLogin(@Body('idToken') idToken: string) {
        return this.authService.googleLoginWithToken(idToken);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {
        // Inicia el flujo de Google Login
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: any) {
        try {
            const profile = req.user;

            // Validaciones
            if (!profile) {
                console.error('❌ Perfil de Google no encontrado en request');
                const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
                return res.redirect(
                    `${frontend}/auth/error?message=${encodeURIComponent('Perfil de Google inválido')}`,
                );
            }

            if (!profile.id || !profile.email) {
                console.error('❌ Datos incompletos del perfil Google:', profile);
                const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
                return res.redirect(
                    `${frontend}/auth/error?message=${encodeURIComponent('Datos de Google incompletos')}`,
                );
            }

            const tokenPayload = await this.authService.googleLoginFromProfile({
                googleId: profile.id,
                email: profile.email,
                name: profile.name || 'Usuario Google',
            });

            // Redirección al Frontend con el token
            const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
            const redirectUrl = `${frontend}/auth/success?token=${encodeURIComponent(tokenPayload.access_token)}`;

            return res.redirect(redirectUrl);
        } catch (error) {
            console.error('❌ Error en Google callback:', error);
            const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
            return res.redirect(
                `${frontend}/auth/error?message=${encodeURIComponent('Error al autenticar con Google')}`,
            );
        }
    }
}