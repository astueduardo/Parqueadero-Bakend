import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Reservation } from '../../reservations/entities/parking-reservatio.entity';

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCEEDED = 'succeeded',
    FAILED = 'failed',
    REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'user_id', type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reservation_id' })
    reservation!: Reservation;

    @Column({ name: 'reservation_id', type: 'uuid', unique: true })
    reservation_id!: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    amount!: number;

    @Column({ length: 10, default: 'USD' })
    currency!: string;

    @Column({ length: 30 })
    payment_method!: string;

    @Column({ nullable: true })
    external_reference!: string; // Stripe PaymentIntent ID

    @Column({
        type: 'varchar',
        length: 20,
        default: PaymentStatus.PENDING,
    })
    status!: PaymentStatus;

    @CreateDateColumn()
    created_at!: Date;
}