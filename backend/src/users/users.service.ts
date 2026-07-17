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
import { In, Repository } from "typeorm";
import { AuthDto, SignUpDto } from "./dto/auth.dto";
import { BulkDeleteUsersDto, CreateUserDto, UpdateUserDto } from "./dto/user-admin.dto";
import { User } from "./entities/user.entity";

type PublicUser = {
  id: number;
  name: string;
  email: string;
  titleRole: string;
  status: string;
  phoneNumber: string;
  country: string;
  stateRegion: string;
  city: string;
  address: string;
  zipCode: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
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
      this.usersRepository.create({
        email,
        name: this.nameFromEmail(email),
        passwordHash,
        titleRole: "Operator",
        status: "active"
      })
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

  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersRepository.find({ order: { createdAt: "DESC" } });
    return users.map((user) => this.toPublicUser(user));
  }

  async create(createUserDto: CreateUserDto) {
    const email = createUserDto.email.trim().toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email } });

    if (existing) {
      throw new ConflictException({
        status: "EMAIL_ALREADY_EXISTS",
        message: "This email has already been registered."
      });
    }

    const passwordHash = await bcrypt.hash(createUserDto.password ?? "TempPass123", 12);
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        email,
        passwordHash,
        name: createUserDto.name.trim(),
        titleRole: createUserDto.titleRole.trim(),
        status: createUserDto.status,
        phoneNumber: this.cleanOptional(createUserDto.phoneNumber),
        country: this.cleanOptional(createUserDto.country),
        stateRegion: this.cleanOptional(createUserDto.stateRegion),
        city: this.cleanOptional(createUserDto.city),
        address: this.cleanOptional(createUserDto.address),
        zipCode: this.cleanOptional(createUserDto.zipCode),
        company: this.cleanOptional(createUserDto.company)
      })
    );

    return this.toPublicUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException({
        status: "USER_NOT_FOUND",
        message: "No user exists for this id."
      });
    }

    if (updateUserDto.email) {
      const email = updateUserDto.email.trim().toLowerCase();
      const existing = await this.usersRepository.findOne({ where: { email } });

      if (existing && existing.id !== id) {
        throw new ConflictException({
          status: "EMAIL_ALREADY_EXISTS",
          message: "This email has already been registered."
        });
      }

      user.email = email;
    }

    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name.trim();
    }

    if (updateUserDto.titleRole !== undefined) {
      user.titleRole = updateUserDto.titleRole.trim();
    }

    if (updateUserDto.status !== undefined) {
      user.status = updateUserDto.status;
    }

    if (updateUserDto.phoneNumber !== undefined) {
      user.phoneNumber = updateUserDto.phoneNumber.trim();
    }

    if (updateUserDto.country !== undefined) {
      user.country = updateUserDto.country.trim();
    }

    if (updateUserDto.stateRegion !== undefined) {
      user.stateRegion = updateUserDto.stateRegion.trim();
    }

    if (updateUserDto.city !== undefined) {
      user.city = updateUserDto.city.trim();
    }

    if (updateUserDto.address !== undefined) {
      user.address = updateUserDto.address.trim();
    }

    if (updateUserDto.zipCode !== undefined) {
      user.zipCode = updateUserDto.zipCode.trim();
    }

    if (updateUserDto.company !== undefined) {
      user.company = updateUserDto.company.trim();
    }

    const saved = await this.usersRepository.save(user);
    return this.toPublicUser(saved);
  }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException({
        status: "USER_NOT_FOUND",
        message: "No user exists for this id."
      });
    }

    return { status: "DELETE_SUCCESS", id };
  }

  async bulkRemove(bulkDeleteUsersDto: BulkDeleteUsersDto) {
    const uniqueIds = Array.from(new Set(bulkDeleteUsersDto.ids));
    await this.usersRepository.delete({ id: In(uniqueIds) });
    return { status: "DELETE_SUCCESS", ids: uniqueIds };
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      titleRole: user.titleRole,
      status: user.status,
      phoneNumber: user.phoneNumber,
      country: user.country,
      stateRegion: user.stateRegion,
      city: user.city,
      address: user.address,
      zipCode: user.zipCode,
      company: user.company,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private cleanOptional(value: string | undefined) {
    return value?.trim() ?? "";
  }

  private nameFromEmail(email: string) {
    return email
      .split("@")[0]
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
}
