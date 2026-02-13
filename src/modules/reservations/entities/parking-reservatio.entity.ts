import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum ReservationStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
    CANCELLED = 'CANCELLED',
}

@Entity('reservations')
export class Reservation {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    user_id: string;

    @Column('uuid')
    space_id: string;

    @Column('uuid', { nullable: true })
    vehicle_id: string;

    @Column('timestamp')
    start_time: Date;

    @Column('timestamp')
    end_time: Date;

    @Column({
        type: 'varchar',
        length: 20,
        default: ReservationStatus.PENDING,
    })
    status: ReservationStatus;

    @Column('text')
    qr_code: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}
