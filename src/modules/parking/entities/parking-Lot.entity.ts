import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { ParkingSpace } from "./parking-space.entity";

@Entity("parking_lots")
export class ParkingLot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 200 })
  address!: string;

  @Column({ name: "total_spaces" })
  totalSpaces!: number;

  @Column({ name: "available_spaces" })
  availableSpaces!: number;

  @Column({ type: "numeric", precision: 2, scale: 1, nullable: true })
  rating!: number;

  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true })
  price!: number;

  @Column({ type: "numeric", precision: 10, scale: 8, nullable: true })
  latitude!: number;

  @Column({ type: "numeric", precision: 11, scale: 8, nullable: true })
  longitude!: number;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  /* Dueño del parqueadero */
  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "owner_id" })
  owner!: User;

  @Column({ name: "owner_id", type: "uuid", nullable: true })
  ownerId!: string;

  /* Espacios del parqueadero */
  @OneToMany(() => ParkingSpace, (space) => space.lot, { cascade: true })
  spaces!: ParkingSpace[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}