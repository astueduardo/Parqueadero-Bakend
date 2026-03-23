import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { LoginAttempt } from './entities/login-attempt.entity';

@Injectable()
export class RateLimitService {
    private readonly MAX_ATTEMPTS = 5;
    private readonly WINDOW_MS = 15 * 60 * 1000; // 15 min

    constructor(
        @InjectRepository(LoginAttempt)
        private readonly repo: Repository<LoginAttempt>,
    ) { }

    async isRateLimited(identifier: string): Promise<boolean> {
        const record = await this.repo.findOne({ where: { identifier } });
        if (!record) return false;

        const expired = Date.now() - record.lastAttempt.getTime() > this.WINDOW_MS;
        if (expired) {
            await this.repo.delete({ identifier });
            return false;
        }

        return record.attempts >= this.MAX_ATTEMPTS;
    }

    async recordAttempt(identifier: string): Promise<void> {
        const record = await this.repo.findOne({ where: { identifier } });

        if (!record) {
            await this.repo.save(this.repo.create({ identifier, attempts: 1 }));
            return;
        }

        const expired = Date.now() - record.lastAttempt.getTime() > this.WINDOW_MS;
        record.attempts = expired ? 1 : record.attempts + 1;
        await this.repo.save(record);
    }

    async resetAttempts(identifier: string): Promise<void> {
        await this.repo.delete({ identifier });
    }

    async getAttemptsRemaining(identifier: string): Promise<number> {
        const record = await this.repo.findOne({ where: { identifier } });
        if (!record) return this.MAX_ATTEMPTS;

        const expired = Date.now() - record.lastAttempt.getTime() > this.WINDOW_MS;
        if (expired) return this.MAX_ATTEMPTS;

        return Math.max(0, this.MAX_ATTEMPTS - record.attempts);
    }
}