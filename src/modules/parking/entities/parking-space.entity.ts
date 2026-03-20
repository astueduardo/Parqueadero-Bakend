import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { ParkingLot } from "./parking-Lot.entity";

@Entity("parking_spaces")
export class ParkingSpace {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => ParkingLot, (lot) => lot.spaces, { onDelete: "CASCADE" })
  @JoinColumn({ name: "lot_id" })
  lot!: ParkingLot;

  @Column({ name: "lot_id", type: "uuid" })
  lotId!: string;

  @Column({ length: 20 })
  code!: string; // ej: A1, B2, C3

  @Column({ length: 20 })
  type!: string; // ej: regular, discapacitado, moto

  @Column({ default: true, name: "is_active" })
  isActive!: boolean;

  @Column({ default: 1 })
  floor!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}