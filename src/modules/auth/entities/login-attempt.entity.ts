import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    identifier!: string;

    @Column({ default: 0 })
    attempts!: number;

    @UpdateDateColumn({ name: 'last_attempt' })
    lastAttempt!: Date;
}