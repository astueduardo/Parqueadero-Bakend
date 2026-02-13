import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("vehicles")
export class Vehicle {
    @PrimaryGeneratedColumn("uuid")
    vehicle_id: string;

    /* Usuario dueño */
    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column("uuid")
    user_id: string;

    /* Datos del vehículo */
    @Column({ length: 15 })
    plate_number: string;

    @Column({ length: 50 })
    brand: string;

    @Column({ length: 50, nullable: true })
    model: string;

    @Column({ length: 30 })
    color: string;

    @Column({ length: 20 })
    vehicle_type: string; // auto | moto | camioneta

    @Column({ type: "int", nullable: true })
    year?: number;

    @Column({ default: false })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;
}
