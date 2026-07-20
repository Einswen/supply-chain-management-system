import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "../companies/entities/company.entity";

export type DashboardMetrics = {
  cards: {
    companyCount: number;
    totalRevenue: number;
    countryCount: number;
    employeeCount: number;
  };
  levelDistribution: Array<{
    level: number;
    count: number;
    percentage: number;
  }>;
  yearlyGrowth: Array<{
    year: number;
    added: number;
    cumulative: number;
  }>;
  sampleSize: number;
  updatedAt: string;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>
  ) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const companies = await this.companiesRepository.find({
      select: {
        companyCode: true,
        level: true,
        country: true,
        foundedYear: true,
        annualRevenue: true,
        employees: true
      }
    });

    const levelCounts = new Map<number, number>();
    const yearCounts = new Map<number, number>();
    const countries = new Set<string>();
    let totalRevenue = 0;
    let employeeCount = 0;

    companies.forEach((company) => {
      totalRevenue += Number(company.annualRevenue);
      employeeCount += company.employees;
      countries.add(company.country);
      levelCounts.set(company.level, (levelCounts.get(company.level) ?? 0) + 1);
      yearCounts.set(company.foundedYear, (yearCounts.get(company.foundedYear) ?? 0) + 1);
    });

    const companyCount = companies.length;
    const levelDistribution = Array.from(levelCounts.entries())
      .sort(([levelA], [levelB]) => levelA - levelB)
      .map(([level, count]) => ({
        level,
        count,
        percentage: companyCount ? Number(((count / companyCount) * 100).toFixed(2)) : 0
      }));

    let cumulative = 0;
    const yearlyGrowth = Array.from(yearCounts.entries())
      .sort(([yearA], [yearB]) => yearA - yearB)
      .map(([year, added]) => {
        cumulative += added;

        return { year, added, cumulative };
      });

    return {
      cards: {
        companyCount,
        totalRevenue,
        countryCount: countries.size,
        employeeCount
      },
      levelDistribution,
      yearlyGrowth,
      sampleSize: companyCount,
      updatedAt: new Date().toISOString()
    };
  }
}
