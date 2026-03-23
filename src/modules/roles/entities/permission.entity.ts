import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 100, unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ length: 50 })
    resource!: string;

    @Column({ length: 50 })
    action!: string;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToMany(() => Role, (role) => role.permissions)
    roles!: Role[];
}