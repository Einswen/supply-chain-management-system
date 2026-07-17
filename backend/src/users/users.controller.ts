import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { AuthDto, SignUpDto } from "./dto/auth.dto";
import { BulkDeleteUsersDto, CreateUserDto, UpdateUserDto } from "./dto/user-admin.dto";
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

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete("bulk")
  bulkRemove(@Body() bulkDeleteUsersDto: BulkDeleteUsersDto) {
    return this.usersService.bulkRemove(bulkDeleteUsersDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
