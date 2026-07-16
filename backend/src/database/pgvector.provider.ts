import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class PgvectorProvider implements OnApplicationBootstrap {
  private readonly logger = new Logger(PgvectorProvider.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    await this.dataSource.query("CREATE EXTENSION IF NOT EXISTS vector");
    this.logger.log("PostgreSQL pgvector extension is ready.");
  }
}
