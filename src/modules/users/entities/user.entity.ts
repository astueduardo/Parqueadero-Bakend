import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string | null;

  @Column({ type: 'varchar', nullable: true })
  googleId!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'local' })
  auth_provider!: 'local' | 'google';

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  username!: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'role_id' })
  role_id!: string | null;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true, eager: false })
  @JoinColumn({ name: 'role_id' })
  roleEntity!: Role;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}