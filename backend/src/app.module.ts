import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompaniesModule } from "./companies/companies.module";
import { CompanyRelationship } from "./companies/entities/company-relationship.entity";
import { Company } from "./companies/entities/company.entity";
import { PgvectorProvider } from "./database/pgvector.provider";
import { UsersModule } from "./users/users.module";
import { User } from "./users/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST ?? "127.0.0.1",
      port: Number(process.env.POSTGRES_PORT ?? 5433),
      username: process.env.POSTGRES_USER ?? "admin",
      password: process.env.POSTGRES_PASSWORD ?? "admin_password",
      database: process.env.POSTGRES_DB ?? "admin_auth",
      entities: [User, Company, CompanyRelationship],
      synchronize: true
    }),
    CompaniesModule,
    UsersModule
  ],
  providers: [PgvectorProvider]
})
export class AppModule {}
