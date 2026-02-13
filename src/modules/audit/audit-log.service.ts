import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async log(
    action: string,
    userId?: string,
    description?: string,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepo.create({
      action,
      user_id: userId,
      description,
    });

    return this.auditLogRepo.save(auditLog);
  }

  async getLogsForUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 1000,
    });
  }
}
