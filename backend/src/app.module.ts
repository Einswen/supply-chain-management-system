import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
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
      entities: [User],
      synchronize: true
    }),
    UsersModule
  ],
  providers: [PgvectorProvider]
})
export class AppModule {}
