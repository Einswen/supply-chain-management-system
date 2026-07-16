import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

export class AuthDto {
  @IsNotEmpty({ message: "Email is required." })
  @IsEmail({}, { message: "Enter a valid email address." })
  email: string;

  @IsNotEmpty({ message: "Password is required." })
  @MinLength(8, { message: "Password must be at least 8 characters." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&._#-]+$/, {
    message: "Password must include letters and numbers and use supported characters."
  })
  password: string;
}

export class SignUpDto extends AuthDto {
  @IsNotEmpty({ message: "Confirm password is required." })
  @MinLength(8, { message: "Confirm password must be at least 8 characters." })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&._#-]+$/, {
    message: "Confirm password must include letters and numbers and use supported characters."
  })
  confirmPassword: string;
}
