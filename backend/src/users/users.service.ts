import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { Repository } from "typeorm";
import { AuthDto, SignUpDto } from "./dto/auth.dto";
import { User } from "./entities/user.entity";

type PublicUser = {
  id: number;
  email: string;
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async signUp(signUpDto: SignUpDto) {
    if (signUpDto.password !== signUpDto.confirmPassword) {
      throw new BadRequestException({
        status: "VALIDATION_ERROR",
        message: "Passwords do not match.",
        errors: ["Passwords do not match."]
      });
    }

    const email = signUpDto.email.trim().toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException({
        status: "EMAIL_ALREADY_EXISTS",
        message: "This email has already been registered."
      });
    }

    const passwordHash = await bcrypt.hash(signUpDto.password, 12);
    const user = await this.usersRepository.save(
      this.usersRepository.create({ email, passwordHash })
    );

    return {
      status: "REGISTER_SUCCESS",
      message: "Registration succeeded. You can now log in.",
      user: this.toPublicUser(user)
    };
  }

  async login(authDto: AuthDto) {
    const email = authDto.email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        status: "USER_NOT_FOUND",
        message: "No user exists for this email."
      });
    }

    const passwordMatches = await bcrypt.compare(authDto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException({
        status: "INVALID_PASSWORD",
        message: "The password is incorrect."
      });
    }

    return {
      status: "LOGIN_SUCCESS",
      message: "Login succeeded.",
      token: randomUUID(),
      user: this.toPublicUser(user)
    };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt
    };
  }
}
