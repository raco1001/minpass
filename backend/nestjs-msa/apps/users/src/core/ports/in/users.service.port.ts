import { Consent } from "../../domain/entities/consent.entity";
import { User } from "../../domain/entities/user.entity";
import { CreateConsentDto } from "../../dtos/consent.dtos";
import { CreateUserDto, FindOneUserDto } from "../../dtos/user.dtos";
import { UpdateUserDto } from "../../dtos/user.dtos";

export const IUsersServicePort = Symbol("IUsersServicePort");

export interface IUsersServicePort {
  register(createUserDto: CreateUserDto): Promise<User>;
  getById(findOneUserDto: FindOneUserDto): Promise<User | null>;
  findAll(): Promise<User[]>;
  changeDisplayName(updateUserDto: UpdateUserDto): Promise<User>;
  deleteUser(findOneUserDto: FindOneUserDto): Promise<void>;
  recordConsent(createConsentDto: CreateConsentDto): Promise<Consent>;
  getConsents(findOneUserDto: FindOneUserDto): Promise<Consent[]>;
}
