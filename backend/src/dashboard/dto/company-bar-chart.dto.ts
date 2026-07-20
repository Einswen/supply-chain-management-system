import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from "class-validator";

export const companyChartDimensions = ["level", "country", "city"] as const;
export type CompanyChartDimension = (typeof companyChartDimensions)[number];

class YearRangeDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  start?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  end?: number;
}

class NumberRangeDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max?: number;
}

export class CompanyChartFilterDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  level?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  country?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  city?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => YearRangeDto)
  founded_year?: YearRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumberRangeDto)
  annual_revenue?: NumberRangeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumberRangeDto)
  employees?: NumberRangeDto;
}

export class CompanyBarChartDto {
  @IsIn(companyChartDimensions)
  dimension: CompanyChartDimension;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyChartFilterDto)
  filter?: CompanyChartFilterDto;
}
