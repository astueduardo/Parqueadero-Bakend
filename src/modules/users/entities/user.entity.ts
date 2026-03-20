import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  password: string | null;

  @Column({ type: "varchar", nullable: true })
  googleId: string | null;

  @Column({
    type: "varchar",
    length: 20,
    default: "local",
  })
  auth_provider: "local" | "google";

  @Column({
    type: "varchar",
    length: 20,
    default: "user",
  })
  role: "user" | "admin" | "owner" | "operator";

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
