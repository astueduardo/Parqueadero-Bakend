import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { ParkingSpace } from "../../parking/entities/parking-space.entity";
import { Vehicle } from "../../vehiculo/entities/vehicle.entity";

export enum ReservationStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    NO_SHOW = "NO_SHOW",
    CANCELLED = "CANCELLED",
}

@Entity("reservations")
export class Reservation {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column({ name: "user_id", type: "uuid" })
    userId: string;

    @ManyToOne(() => ParkingSpace)
    @JoinColumn({ name: "space_id" })
    space: ParkingSpace;

    @Column({ name: "space_id", type: "uuid" })
    spaceId: string;

    @ManyToOne(() => Vehicle, { nullable: true })
    @JoinColumn({ name: "vehicle_id" })
    vehicle: Vehicle;

    @Column({ name: "vehicle_id", type: "uuid", nullable: true })
    vehicleId: string;

    @Column({ name: "start_time", type: "timestamp" })
    startTime: Date;

    @Column({ name: "end_time", type: "timestamp" })
    endTime: Date;

    @Column({
        type: "enum",
        enum: ReservationStatus,
        default: ReservationStatus.PENDING,
    })
    status: ReservationStatus;

    @Column({ name: "qr_code", type: "text" })
    qrCode: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}