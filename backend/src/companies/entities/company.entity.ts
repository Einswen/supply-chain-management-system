import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "company" })
export class Company {
  @PrimaryColumn({ name: "company_code", type: "varchar", length: 32 })
  companyCode: string;

  @Column({ name: "company_name", type: "varchar", length: 255 })
  companyName: string;

  @Column({ type: "int" })
  level: number;

  @Column({ type: "varchar", length: 120 })
  country: string;

  @Column({ type: "varchar", length: 120 })
  city: string;

  @Column({ name: "founded_year", type: "int" })
  foundedYear: number;

  @Column({ name: "annual_revenue", type: "bigint" })
  annualRevenue: string;

  @Column({ type: "int" })
  employees: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
