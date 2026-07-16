import { Body, Controller, Post } from "@nestjs/common";
import { AuthDto, SignUpDto } from "./dto/auth.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post("signup")
  signUp(@Body() signUpDto: SignUpDto) {
    return this.usersService.signUp(signUpDto);
  }

  @Post("login")
  login(@Body() authDto: AuthDto) {
    return this.usersService.login(authDto);
  }
}
