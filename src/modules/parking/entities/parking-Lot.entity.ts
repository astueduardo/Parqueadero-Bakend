import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ParkingSpace } from "./parking-space.entity";
import { User } from "../../users/entities/user.entity";

@Entity("parking_lots")
export class ParkingLot {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: "numeric" })
  total_spaces: number;

  @Column({ type: "numeric" })
  available_spaces: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: "numeric", nullable: true })
  price: number;

  @Column({ type: "numeric", nullable: true })
  rating: number;

  @Column({ type: "numeric", precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: "numeric", precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "owner_id" })
  owner: User;

  @Column("uuid", { nullable: true })
  owner_id: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => ParkingSpace, (space) => space.lot)
  spaces: ParkingSpace[];

  @OneToMany("Favorite", "parkingLot")
  favorites: any[];
}

