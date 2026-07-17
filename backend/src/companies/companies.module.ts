import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompaniesController } from "./companies.controller";
import { CompaniesService } from "./companies.service";
import { CompanyRelationship } from "./entities/company-relationship.entity";
import { Company } from "./entities/company.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyRelationship])],
  controllers: [CompaniesController],
  providers: [CompaniesService]
})
export class CompaniesModule {}
