import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Company } from "../companies/entities/company.entity";
import {
  CompanyBarChartDto,
  CompanyChartDimension,
  CompanyChartFilterDto
} from "./dto/company-bar-chart.dto";

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

export type CompanyBarChartResult = {
  dimension: CompanyChartDimension;
  bars: Array<{ label: string; count: number }>;
  matchedCompanies: number;
  filterOptions: {
    levels: number[];
    countries: string[];
    cities: string[];
    ranges: {
      foundedYear: { min: number | null; max: number | null };
      annualRevenue: { min: number | null; max: number | null };
      employees: { min: number | null; max: number | null };
    };
  };
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

  async getCompaniesByFilter({
    dimension,
    filter = {}
  }: CompanyBarChartDto): Promise<CompanyBarChartResult> {
    const dimensionColumn = {
      level: "company.level",
      country: "company.country",
      city: "company.city"
    }[dimension];

    const filteredQuery = this.companiesRepository.createQueryBuilder("company");
    this.applyCompanyFilters(filteredQuery, filter);

    const [rows, matchedCompanies, filterOptions] = await Promise.all([
      filteredQuery
        .clone()
        .select(dimensionColumn, "label")
        .addSelect("COUNT(*)", "count")
        .groupBy(dimensionColumn)
        .orderBy(dimensionColumn, "ASC")
        .getRawMany<{ label: string | number; count: string }>(),
      filteredQuery.getCount(),
      this.getCompanyFilterOptions()
    ]);

    return {
      dimension,
      bars: rows.map((row) => ({ label: String(row.label), count: Number(row.count) })),
      matchedCompanies,
      filterOptions
    };
  }

  private applyCompanyFilters(
    query: ReturnType<Repository<Company>["createQueryBuilder"]>,
    filter: CompanyChartFilterDto
  ) {
    if (filter.level?.length) {
      query.andWhere("company.level IN (:...levels)", { levels: filter.level });
    }

    if (filter.country?.length) {
      query.andWhere("company.country IN (:...countries)", { countries: filter.country });
    }

    if (filter.city?.length) {
      query.andWhere("company.city IN (:...cities)", { cities: filter.city });
    }

    if (filter.founded_year?.start !== undefined) {
      query.andWhere("company.founded_year >= :foundedYearStart", {
        foundedYearStart: filter.founded_year.start
      });
    }

    if (filter.founded_year?.end !== undefined) {
      query.andWhere("company.founded_year <= :foundedYearEnd", {
        foundedYearEnd: filter.founded_year.end
      });
    }

    if (filter.annual_revenue?.min !== undefined) {
      query.andWhere("company.annual_revenue >= :annualRevenueMin", {
        annualRevenueMin: filter.annual_revenue.min
      });
    }

    if (filter.annual_revenue?.max !== undefined) {
      query.andWhere("company.annual_revenue <= :annualRevenueMax", {
        annualRevenueMax: filter.annual_revenue.max
      });
    }

    if (filter.employees?.min !== undefined) {
      query.andWhere("company.employees >= :employeesMin", { employeesMin: filter.employees.min });
    }

    if (filter.employees?.max !== undefined) {
      query.andWhere("company.employees <= :employeesMax", { employeesMax: filter.employees.max });
    }
  }

  private async getCompanyFilterOptions(): Promise<CompanyBarChartResult["filterOptions"]> {
    const [levels, countries, cities, ranges] = await Promise.all([
      this.companiesRepository
        .createQueryBuilder("company")
        .select("DISTINCT company.level", "value")
        .orderBy("company.level", "ASC")
        .getRawMany<{ value: string }>(),
      this.companiesRepository
        .createQueryBuilder("company")
        .select("DISTINCT company.country", "value")
        .orderBy("company.country", "ASC")
        .getRawMany<{ value: string }>(),
      this.companiesRepository
        .createQueryBuilder("company")
        .select("DISTINCT company.city", "value")
        .orderBy("company.city", "ASC")
        .getRawMany<{ value: string }>(),
      this.companiesRepository
        .createQueryBuilder("company")
        .select("MIN(company.founded_year)", "foundedYearMin")
        .addSelect("MAX(company.founded_year)", "foundedYearMax")
        .addSelect("MIN(company.annual_revenue)", "annualRevenueMin")
        .addSelect("MAX(company.annual_revenue)", "annualRevenueMax")
        .addSelect("MIN(company.employees)", "employeesMin")
        .addSelect("MAX(company.employees)", "employeesMax")
        .getRawOne<{
          foundedYearMin: string | null;
          foundedYearMax: string | null;
          annualRevenueMin: string | null;
          annualRevenueMax: string | null;
          employeesMin: string | null;
          employeesMax: string | null;
        }>()
    ]);

    return {
      levels: levels.map((row) => Number(row.value)),
      countries: countries.map((row) => row.value),
      cities: cities.map((row) => row.value),
      ranges: {
        foundedYear: { min: this.toNumber(ranges?.foundedYearMin), max: this.toNumber(ranges?.foundedYearMax) },
        annualRevenue: {
          min: this.toNumber(ranges?.annualRevenueMin),
          max: this.toNumber(ranges?.annualRevenueMax)
        },
        employees: { min: this.toNumber(ranges?.employeesMin), max: this.toNumber(ranges?.employeesMax) }
      }
    };
  }

  private toNumber(value: string | null | undefined) {
    return value === null || value === undefined ? null : Number(value);
  }
}
