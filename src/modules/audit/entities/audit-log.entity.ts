import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { nullable: true })
  user_id: string | null;

  @Column({ length: 120 })
  action: string; // LOGIN, CREATE_RESERVATION, UPDATE_PROFILE, etc.

  @Column('text', { nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;
}
