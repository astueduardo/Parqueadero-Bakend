import { Injectable } from '@nestjs/common';

interface LoginAttempt {
    attempts: number;
    lastAttempt: Date;
}

@Injectable()
export class RateLimitService {
    private loginAttempts: Map<string, LoginAttempt> = new Map();
    private readonly MAX_ATTEMPTS = 5; // Máximo 5 intentos
    private readonly WINDOWS_MS = 15 * 60 * 1000; // Ventana de 15 minutos

    isRateLimited(identifier: string): boolean {
        const attempt = this.loginAttempts.get(identifier);

        if (!attempt) {
            return false;
        }

        const now = new Date();
        const timePassed = now.getTime() - attempt.lastAttempt.getTime();

        // Si ha pasado la ventana, resetear
        if (timePassed > this.WINDOWS_MS) {
            this.loginAttempts.delete(identifier);
            return false;
        }

        return attempt.attempts >= this.MAX_ATTEMPTS;
    }

    recordAttempt(identifier: string): void {
        const attempt = this.loginAttempts.get(identifier) || {
            attempts: 0,
            lastAttempt: new Date(),
        };

        attempt.attempts += 1;
        attempt.lastAttempt = new Date();

        this.loginAttempts.set(identifier, attempt);
    }

    resetAttempts(identifier: string): void {
        this.loginAttempts.delete(identifier);
    }

    getAttemptsRemaining(identifier: string): number {
        const attempt = this.loginAttempts.get(identifier);

        if (!attempt) {
            return this.MAX_ATTEMPTS;
        }

        const now = new Date();
        const timePassed = now.getTime() - attempt.lastAttempt.getTime();

        // Si ha pasado la ventana, resetear
        if (timePassed > this.WINDOWS_MS) {
            this.loginAttempts.delete(identifier);
            return this.MAX_ATTEMPTS;
        }

        return Math.max(0, this.MAX_ATTEMPTS - attempt.attempts);
    }
}
