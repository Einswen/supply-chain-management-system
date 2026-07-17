import {
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { readFile } from "fs/promises";
import { join } from "path";
import { Repository } from "typeorm";
import { CreateCompanyDto, UpdateCompanyDto } from "./dto/company.dto";
import { CompanyRelationship } from "./entities/company-relationship.entity";
import { Company } from "./entities/company.entity";

type CompanyCsvRow = {
  company_code: string;
  company_name: string;
  level: string;
  country: string;
  city: string;
  founded_year: string;
  annual_revenue: string;
  employees: string;
};

type RelationshipCsvRow = {
  company_code: string;
  parent_company: string;
};

export type CompanyResponse = {
  companyCode: string;
  companyName: string;
  level: number;
  country: string;
  city: string;
  foundedYear: number;
  annualRevenue: number;
  employees: number;
  revenueEfficiency: number;
  parentCompanyCode: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class CompaniesService implements OnModuleInit {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(CompanyRelationship)
    private readonly relationshipsRepository: Repository<CompanyRelationship>
  ) {}

  async onModuleInit() {
    await this.seedFromCsv();
  }

  async findAll(): Promise<CompanyResponse[]> {
    const [companies, relationships] = await Promise.all([
      this.companiesRepository.find({ order: { companyName: "ASC" } }),
      this.relationshipsRepository.find()
    ]);
    const relationshipMap = new Map(
      relationships.map((relationship) => [relationship.companyCode, relationship.parentCompanyCode])
    );

    return companies.map((company) => this.toResponse(company, relationshipMap.get(company.companyCode) ?? null));
  }

  async create(createCompanyDto: CreateCompanyDto) {
    const companyCode = createCompanyDto.companyCode.trim();
    const existing = await this.companiesRepository.findOne({ where: { companyCode } });

    if (existing) {
      throw new ConflictException({
        status: "COMPANY_ALREADY_EXISTS",
        message: "A company with this code already exists."
      });
    }

    const company = await this.companiesRepository.save(
      this.companiesRepository.create({
        companyCode,
        companyName: createCompanyDto.companyName.trim(),
        level: createCompanyDto.level,
        country: createCompanyDto.country.trim(),
        city: createCompanyDto.city.trim(),
        foundedYear: createCompanyDto.foundedYear,
        annualRevenue: String(createCompanyDto.annualRevenue),
        employees: createCompanyDto.employees
      })
    );

    const relationship = await this.saveRelationship(companyCode, createCompanyDto.parentCompanyCode);
    return this.toResponse(company, relationship.parentCompanyCode);
  }

  async update(companyCode: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companiesRepository.findOne({ where: { companyCode } });

    if (!company) {
      throw new NotFoundException({
        status: "COMPANY_NOT_FOUND",
        message: "No company exists for this code."
      });
    }

    if (updateCompanyDto.companyName !== undefined) {
      company.companyName = updateCompanyDto.companyName.trim();
    }

    if (updateCompanyDto.level !== undefined) {
      company.level = updateCompanyDto.level;
    }

    if (updateCompanyDto.country !== undefined) {
      company.country = updateCompanyDto.country.trim();
    }

    if (updateCompanyDto.city !== undefined) {
      company.city = updateCompanyDto.city.trim();
    }

    if (updateCompanyDto.foundedYear !== undefined) {
      company.foundedYear = updateCompanyDto.foundedYear;
    }

    if (updateCompanyDto.annualRevenue !== undefined) {
      company.annualRevenue = String(updateCompanyDto.annualRevenue);
    }

    if (updateCompanyDto.employees !== undefined) {
      company.employees = updateCompanyDto.employees;
    }

    const [saved, relationship] = await Promise.all([
      this.companiesRepository.save(company),
      updateCompanyDto.parentCompanyCode !== undefined
        ? this.saveRelationship(companyCode, updateCompanyDto.parentCompanyCode)
        : this.relationshipsRepository.findOne({ where: { companyCode } })
    ]);

    return this.toResponse(saved, relationship?.parentCompanyCode ?? null);
  }

  async remove(companyCode: string) {
    await this.relationshipsRepository.delete({ companyCode });
    const result = await this.companiesRepository.delete({ companyCode });

    if (!result.affected) {
      throw new NotFoundException({
        status: "COMPANY_NOT_FOUND",
        message: "No company exists for this code."
      });
    }

    return { status: "DELETE_SUCCESS", companyCode };
  }

  private async seedFromCsv() {
    const dataDir = join(process.cwd(), "database", "data");
    const [companiesCsv, relationshipsCsv] = await Promise.all([
      this.safeRead(join(dataDir, "companies_0708.csv")),
      this.safeRead(join(dataDir, "relationships_0708.csv"))
    ]);

    if (!companiesCsv || !relationshipsCsv) {
      return;
    }

    const companyRows = this.parseCsv<CompanyCsvRow>(companiesCsv);
    const relationshipRows = this.parseCsv<RelationshipCsvRow>(relationshipsCsv);

    if (companyRows.length) {
      await this.companiesRepository.upsert(
        companyRows.map((row) => ({
          companyCode: row.company_code.trim(),
          companyName: row.company_name.trim(),
          level: Number(row.level),
          country: row.country.trim(),
          city: row.city.trim(),
          foundedYear: Number(row.founded_year),
          annualRevenue: row.annual_revenue,
          employees: Number(row.employees)
        })),
        ["companyCode"]
      );
    }

    if (relationshipRows.length) {
      await this.relationshipsRepository.upsert(
        relationshipRows.map((row) => ({
          companyCode: row.company_code.trim(),
          parentCompanyCode: row.parent_company.trim() || null
        })),
        ["companyCode"]
      );
    }
  }

  private async saveRelationship(companyCode: string, parentCompanyCode: string | null | undefined) {
    return this.relationshipsRepository.save(
      this.relationshipsRepository.create({
        companyCode,
        parentCompanyCode: parentCompanyCode?.trim() || null
      })
    );
  }

  private async safeRead(path: string) {
    try {
      return await readFile(path, "utf8");
    } catch {
      return null;
    }
  }

  private parseCsv<T extends Record<string, string>>(input: string): T[] {
    const rows = input
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => this.parseCsvLine(line));
    const [headers, ...records] = rows;

    if (!headers) {
      return [];
    }

    return records.map((record) =>
      headers.reduce<Record<string, string>>((row, header, index) => {
        row[header] = record[index] ?? "";
        return row;
      }, {}) as T
    );
  }

  private parseCsvLine(line: string) {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];

      if (char === "\"" && inQuotes && next === "\"") {
        current += "\"";
        index += 1;
      } else if (char === "\"") {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }

  private toResponse(company: Company, parentCompanyCode: string | null): CompanyResponse {
    const annualRevenue = Number(company.annualRevenue);

    return {
      companyCode: company.companyCode,
      companyName: company.companyName,
      level: company.level,
      country: company.country,
      city: company.city,
      foundedYear: company.foundedYear,
      annualRevenue,
      employees: company.employees,
      revenueEfficiency: annualRevenue / company.employees,
      parentCompanyCode,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };
  }
}
