import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateCompanyDto {
  @IsNotEmpty({ message: "Company code is required." })
  @IsString({ message: "Company code must be text." })
  companyCode: string;

  @IsNotEmpty({ message: "Company name is required." })
  @IsString({ message: "Company name must be text." })
  companyName: string;

  @Type(() => Number)
  @IsInt({ message: "Level must be an integer." })
  @Min(1, { message: "Level must be at least 1." })
  level: number;

  @IsNotEmpty({ message: "Country is required." })
  @IsString({ message: "Country must be text." })
  country: string;

  @IsNotEmpty({ message: "City is required." })
  @IsString({ message: "City must be text." })
  city: string;

  @Type(() => Number)
  @IsInt({ message: "Founded year must be an integer." })
  @Min(1, { message: "Founded year must be valid." })
  foundedYear: number;

  @Type(() => Number)
  @IsNumber({}, { message: "Annual revenue must be numeric." })
  @Min(0, { message: "Annual revenue cannot be negative." })
  annualRevenue: number;

  @Type(() => Number)
  @IsInt({ message: "Employees must be an integer." })
  @Min(1, { message: "Employees must be at least 1." })
  employees: number;

  @IsOptional()
  @IsString({ message: "Parent company code must be text." })
  parentCompanyCode?: string | null;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString({ message: "Company name must be text." })
  companyName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Level must be an integer." })
  @Min(1, { message: "Level must be at least 1." })
  level?: number;

  @IsOptional()
  @IsString({ message: "Country must be text." })
  country?: string;

  @IsOptional()
  @IsString({ message: "City must be text." })
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Founded year must be an integer." })
  @Min(1, { message: "Founded year must be valid." })
  foundedYear?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: "Annual revenue must be numeric." })
  @Min(0, { message: "Annual revenue cannot be negative." })
  annualRevenue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Employees must be an integer." })
  @Min(1, { message: "Employees must be at least 1." })
  employees?: number;

  @IsOptional()
  @IsString({ message: "Parent company code must be text." })
  parentCompanyCode?: string | null;
}
