import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn
} from "typeorm";

@Entity({ name: "user" })
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 160, default: "New User" })
  name: string;

  @Column({ type: "varchar", length: 255 })
  email: string;

  @Column({ name: "title_role", type: "varchar", length: 120, default: "Operator" })
  titleRole: string;

  @Column({ type: "varchar", length: 32, default: "active" })
  status: string;

  @Column({ name: "phone_number", type: "varchar", length: 80, default: "" })
  phoneNumber: string;

  @Column({ type: "varchar", length: 120, default: "" })
  country: string;

  @Column({ name: "state_region", type: "varchar", length: 120, default: "" })
  stateRegion: string;

  @Column({ type: "varchar", length: 120, default: "" })
  city: string;

  @Column({ type: "varchar", length: 255, default: "" })
  address: string;

  @Column({ name: "zip_code", type: "varchar", length: 40, default: "" })
  zipCode: string;

  @Column({ type: "varchar", length: 160, default: "" })
  company: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
