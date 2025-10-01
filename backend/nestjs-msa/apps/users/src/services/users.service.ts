import { Inject, Injectable } from "@nestjs/common";

import { Purpose } from "@src/core/domain/constants/consent.constants";
import { Consent } from "@src/core/domain/entities/consent.entity";
import { User } from "@src/core/domain/entities/user.entity";
import { CreateConsentDto } from "@src/core/dtos/consent.dtos";
import {
  CreateUserDto,
  FindOneUserDto,
  UpdateUserDto,
} from "@src/core/dtos/user.dtos";
import { UsersServicePort } from "@src/core/ports/in/users.service.port";
import { ConsentsRepositoryPort } from "@src/core/ports/out/consents.repository.port";
import { UsersRepositoryPort } from "@src/core/ports/out/users.repository.port";

@Injectable()
export class UsersService implements UsersServicePort {
  constructor(
    @Inject(UsersRepositoryPort)
    private readonly users: UsersRepositoryPort,
    @Inject(ConsentsRepositoryPort)
    private readonly consents: ConsentsRepositoryPort,
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

  async findAll() {
    return await this.users.findAll();
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
