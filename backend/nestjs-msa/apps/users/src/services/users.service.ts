import { Inject, Injectable } from "@nestjs/common";
import { User } from "../core/domain/entities/user.entity";
import { IUserRepository } from "../core/ports/out/user.repository.port";
import { IConsentRepository } from "../core/ports/out/consent.repository.port";
import { Consent } from "../core/domain/entities/consent.entity";
import { IUserService } from "../core/ports/in/user.service.port";
import { Purpose } from "../core/domain/constants/consent.constants";
import {
  CreateUserDto,
  FindOneUserDto,
  UpdateUserDto,
} from "../core/dtos/user.dtos";
import { CreateConsentDto } from "../core/dtos/consent.dtos";

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @Inject(IUserRepository)
    private readonly users: IUserRepository,
    @Inject(IConsentRepository)
    private readonly consents: IConsentRepository,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = User.createNew(
      createUserDto.email,
      createUserDto.locale,
      createUserDto.displayName,
    );
    await this.users.save(user);
    return user;
  }

  async getById(findOneUserDto: FindOneUserDto) {
    return await this.users.findById(findOneUserDto.id);
  }

  async changeDisplayName(updateUserDto: UpdateUserDto) {
    const user = await this.users.findById(updateUserDto.id);
    if (!user) throw new Error("User not found");
    user.changeDisplayName(updateUserDto.displayName);
    await this.users.save(user);
    return user;
  }

  async deleteUser(findOneUserDto: FindOneUserDto) {
    const user = await this.users.findById(findOneUserDto.id);
    if (!user) throw new Error("User not found");
    user.softDelete();
    await this.users.delete(user.id);
  }

  async recordConsent(createConsentDto: CreateConsentDto) {
    const consent = Consent.record(
      createConsentDto.userId,
      createConsentDto.purpose as Purpose,
      createConsentDto.scope,
      createConsentDto.grantedAt ?? new Date(),
    );
    await this.consents.append(consent);
    return consent;
  }

  async getConsents(findOneUserDto: FindOneUserDto) {
    return await this.consents.listByUser(findOneUserDto.id);
  }
}
