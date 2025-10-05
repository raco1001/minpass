import { Consent } from "@users/core/domain/entities/consent.entity";
import { User } from "../../domain/entities/user.entity";
import { CreateConsentDto } from "@users/core/dtos/consent.dtos";
import { CreateUserDto, FindOneUserDto } from "@users/core/dtos/user.dtos";
import { UpdateUserDto } from "@users/core/dtos/user.dtos";

export abstract class UsersServicePort {
  abstract register(createUserDto: CreateUserDto): Promise<User>;
  abstract getById(findOneUserDto: FindOneUserDto): Promise<User | null>;
  abstract findAll(): Promise<User[]>;
  abstract changeDisplayName(updateUserDto: UpdateUserDto): Promise<User>;
  abstract deleteUser(findOneUserDto: FindOneUserDto): Promise<void>;
  abstract recordConsent(createConsentDto: CreateConsentDto): Promise<Consent>;
  abstract getConsents(findOneUserDto: FindOneUserDto): Promise<Consent[]>;
}
