import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    Unique,
} from "typeorm";
import { User } from "../../../users/entities/user.entity";
import { ParkingLot } from "../../entities/parking-Lot.entity";

@Entity("favorites")
@Unique("uq_fav_user_parking", ["userId", "parkingLotId"]) // evita duplicados
export class Favorite {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: "user_id", type: "uuid" })
    userId!: string;

    @ManyToOne(() => ParkingLot, { onDelete: "CASCADE" })
    @JoinColumn({ name: "parking_lot_id" })
    parkingLot!: ParkingLot;

    @Column({ name: "parking_lot_id", type: "uuid" })
    parkingLotId!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}