import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompanyRelationship } from "../companies/entities/company-relationship.entity";
import { Company } from "../companies/entities/company.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyRelationship])],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
