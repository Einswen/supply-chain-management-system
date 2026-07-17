import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "company_relationship" })
export class CompanyRelationship {
  @PrimaryColumn({ name: "company_code", type: "varchar", length: 32 })
  companyCode: string;

  @Column({ name: "parent_company", type: "varchar", length: 32, nullable: true })
  parentCompanyCode: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
