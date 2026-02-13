import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { ParkingLot } from "./parking-Lot.entity";

@Entity("parking_spaces")
export class ParkingSpace {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 20 })
  code: string; // Ej: "A-1", "B-15"

  @Column({ length: 20, default: "regular" })
  type: string; // regular, handicapped, electric, motorcycle

  @Column("int", { default: 1 })
  floor: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ParkingLot, (lot) => lot.spaces, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "lot_id" })
  lot: ParkingLot;

  @Column("uuid")
  lot_id: string;

  // Relación con reservas (será creada en módulo de reservations)
  @OneToMany("Reservation", "space")
  reservations: any[];
}