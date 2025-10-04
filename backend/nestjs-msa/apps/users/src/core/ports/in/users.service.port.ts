import { Consent } from "@src/core/domain/entities/consent.entity";
import { User } from "../../domain/entities/user.entity";
import { CreateConsentDto } from "@src/core/dtos/consent.dtos";
import { CreateUserDto, FindOneUserDto } from "@src/core/dtos/user.dtos";
import { UpdateUserDto } from "@src/core/dtos/user.dtos";

export abstract class UsersServicePort {
  abstract register(createUserDto: CreateUserDto): Promise<User>;
  abstract getById(findOneUserDto: FindOneUserDto): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract changeDisplayName(updateUserDto: UpdateUserDto): Promise<User>;
  abstract deleteUser(findOneUserDto: FindOneUserDto): Promise<void>;
  abstract recordConsent(createConsentDto: CreateConsentDto): Promise<Consent>;
  abstract getConsents(findOneUserDto: FindOneUserDto): Promise<Consent[]>;
}
