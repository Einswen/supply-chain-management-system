import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength
} from "class-validator";

export const USER_STATUSES = ["active", "pending", "inactive", "suspended", "banned"] as const;

export class CreateUserDto {
  @IsNotEmpty({ message: "Name is required." })
  @IsString({ message: "Name must be text." })
  name: string;

  @IsNotEmpty({ message: "Email is required." })
  @IsEmail({}, { message: "Enter a valid email address." })
  email: string;

  @IsNotEmpty({ message: "Title or role is required." })
  @IsString({ message: "Title or role must be text." })
  titleRole: string;

  @IsIn(USER_STATUSES, { message: "Status is not supported." })
  status: string;

  @IsOptional()
  @IsString({ message: "Phone number must be text." })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: "Country must be text." })
  country?: string;

  @IsOptional()
  @IsString({ message: "State or region must be text." })
  stateRegion?: string;

  @IsOptional()
  @IsString({ message: "City must be text." })
  city?: string;

  @IsOptional()
  @IsString({ message: "Address must be text." })
  address?: string;

  @IsOptional()
  @IsString({ message: "Zip code must be text." })
  zipCode?: string;

  @IsOptional()
  @IsString({ message: "Company must be text." })
  company?: string;

  @IsOptional()
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&._#-]+$/, {
    message: "Password must include letters and numbers and use supported characters."
  })
  password?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: "Name must be text." })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: "Enter a valid email address." })
  email?: string;

  @IsOptional()
  @IsString({ message: "Title or role must be text." })
  titleRole?: string;

  @IsOptional()
  @IsIn(USER_STATUSES, { message: "Status is not supported." })
  status?: string;

  @IsOptional()
  @IsString({ message: "Phone number must be text." })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: "Country must be text." })
  country?: string;

  @IsOptional()
  @IsString({ message: "State or region must be text." })
  stateRegion?: string;

  @IsOptional()
  @IsString({ message: "City must be text." })
  city?: string;

  @IsOptional()
  @IsString({ message: "Address must be text." })
  address?: string;

  @IsOptional()
  @IsString({ message: "Zip code must be text." })
  zipCode?: string;

  @IsOptional()
  @IsString({ message: "Company must be text." })
  company?: string;
}

export class BulkDeleteUsersDto {
  @IsArray({ message: "User ids must be an array." })
  @ArrayNotEmpty({ message: "Select at least one user." })
  @IsInt({ each: true, message: "User ids must be integers." })
  ids: number[];
}
