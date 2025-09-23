import { User } from "../../domain/entities/user.entity";
import { Consent } from "../../domain/entities/consent.entity";
import { Purpose } from "../../domain/constants/consent.constants";
import { CreateUserDto, FindOneUserDto } from "../../dtos/user.dtos";
import { CreateConsentDto } from "../../dtos/consent.dtos";
import { UpdateUserDto } from "../../dtos/user.dtos";

export const IUserService = Symbol("IUserService");

export interface IUserService {
  register(createUserDto: CreateUserDto): Promise<User>;
  getById(findOneUserDto: FindOneUserDto): Promise<User | null>;
  changeDisplayName(updateUserDto: UpdateUserDto): Promise<User>;
  deleteUser(findOneUserDto: FindOneUserDto): Promise<void>;
  recordConsent(
    createConsentDto: CreateConsentDto,
    code: Purpose,
    version: string,
    grantedAt: Date,
  ): Promise<Consent>;
  getConsents(findOneUserDto: FindOneUserDto): Promise<Consent[]>;
}
