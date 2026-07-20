export type DashboardCompanyRecord = {
  companyCode: string;
  companyName: string;
  level: number;
  country: string;
  foundedYear: number;
  annualRevenue: number;
  employees: number;
};

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

export type CompanyChartDimension = "level" | "country" | "city";

export type CompanyBarChartQuery = {
  dimension: CompanyChartDimension;
  filter: {
    level?: number[];
    country?: string[];
    city?: string[];
    founded_year?: { start?: number; end?: number };
    annual_revenue?: { min?: number; max?: number };
    employees?: { min?: number; max?: number };
  };
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

export const dashboardDummyCompanies: DashboardCompanyRecord[] = [
  {
    companyCode: "C0",
    companyName: "Rodriguez, Figueroa and Sanchez",
    level: 1,
    country: "China",
    foundedYear: 1994,
    annualRevenue: 317736,
    employees: 4606
  },
  {
    companyCode: "C01",
    companyName: "Doyle Ltd",
    level: 2,
    country: "Japan",
    foundedYear: 1917,
    annualRevenue: 429408,
    employees: 889
  },
  {
    companyCode: "C02",
    companyName: "Mcclain, Miller and Henderson",
    level: 2,
    country: "China",
    foundedYear: 1954,
    annualRevenue: 894345,
    employees: 310
  },
  {
    companyCode: "C03",
    companyName: "Davis and Sons",
    level: 2,
    country: "USA",
    foundedYear: 1927,
    annualRevenue: 391732,
    employees: 1955
  },
  {
    companyCode: "C147",
    companyName: "Adams, Christian and Rivas",
    level: 3,
    country: "USA",
    foundedYear: 1998,
    annualRevenue: 252573,
    employees: 300
  },
  {
    companyCode: "C241",
    companyName: "Young Ltd",
    level: 3,
    country: "Japan",
    foundedYear: 2013,
    annualRevenue: 256133,
    employees: 112
  },
  {
    companyCode: "C0903",
    companyName: "Abbott Ltd",
    level: 4,
    country: "USA",
    foundedYear: 2021,
    annualRevenue: 83942,
    employees: 498
  },
  {
    companyCode: "C1803",
    companyName: "Abbott-Phelps",
    level: 4,
    country: "UK",
    foundedYear: 2014,
    annualRevenue: 77170,
    employees: 40
  },
  {
    companyCode: "C0953",
    companyName: "Acosta, Garcia and Moreno",
    level: 4,
    country: "India",
    foundedYear: 2006,
    annualRevenue: 105003,
    employees: 417
  },
  {
    companyCode: "C1252",
    companyName: "Adams and Sons",
    level: 4,
    country: "Canada",
    foundedYear: 2019,
    annualRevenue: 69516,
    employees: 342
  }
];

export function calculateDashboardMetrics(companies: DashboardCompanyRecord[]): DashboardMetrics {
  const countries = new Set<string>();
  const levelCounts = new Map<number, number>();
  const yearCounts = new Map<number, number>();
  let totalRevenue = 0;
  let employeeCount = 0;

  companies.forEach((company) => {
    countries.add(company.country);
    totalRevenue += company.annualRevenue;
    employeeCount += company.employees;
    levelCounts.set(company.level, (levelCounts.get(company.level) ?? 0) + 1);
    yearCounts.set(company.foundedYear, (yearCounts.get(company.foundedYear) ?? 0) + 1);
  });

  let cumulative = 0;

  return {
    cards: {
      companyCount: companies.length,
      totalRevenue,
      countryCount: countries.size,
      employeeCount
    },
    levelDistribution: Array.from(levelCounts.entries())
      .sort(([levelA], [levelB]) => levelA - levelB)
      .map(([level, count]) => ({
        level,
        count,
        percentage: companies.length ? Number(((count / companies.length) * 100).toFixed(2)) : 0
      })),
    yearlyGrowth: Array.from(yearCounts.entries())
      .sort(([yearA], [yearB]) => yearA - yearB)
      .map(([year, added]) => {
        cumulative += added;
        return { year, added, cumulative };
      }),
    sampleSize: companies.length,
    updatedAt: new Date().toISOString()
  };
}

export function formatCompactNumber(value: number) {
  return formatCompactValue(value);
}

export function formatCompactCurrency(value: number) {
  if (Math.abs(value) < 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  return `$${formatCompactValue(value)}`;
}

function formatCompactValue(value: number) {
  const units = [
    { suffix: "T", divisor: 1_000_000_000_000 },
    { suffix: "B", divisor: 1_000_000_000 },
    { suffix: "M", divisor: 1_000_000 },
    { suffix: "K", divisor: 1_000 }
  ];
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);
  const unit = units.find((item) => absoluteValue >= item.divisor);

  if (!unit) {
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)}`;
  }

  const truncated = Math.floor((absoluteValue / unit.divisor) * 10) / 10;
  const compactNumber = truncated.toFixed(1).replace(/\.0$/, "");

  return `${sign}${compactNumber}${unit.suffix}`;
}
