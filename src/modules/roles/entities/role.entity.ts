import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToMany, JoinTable, OneToMany
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 50, unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id' },
        inverseJoinColumn: { name: 'permission_id' },
    })
    permissions!: Permission[];

    @OneToMany(() => User, (user) => user.roleEntity)
    users!: User[];
}