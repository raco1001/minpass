import { Injectable } from "@nestjs/common";
import { User } from "../core/domain/entities/user.entity";
import { IUserRepository } from "../core/ports/out/user.repository.port";
import { IConsentRepository } from "../core/ports/out/consent.repository.port";
import { v7 as uuidv7 } from "uuid";
import { Consent } from "../core/domain/entities/consent.entity";
import { IUserService } from "../core/ports/in/user.service.port";
@Injectable()
export class UsersService implements IUserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly consents: IConsentRepository,
  ) {}

  async register(email: string, displayName?: string) {
    const id = uuidv7();
    const user = User.createNew(id, email, displayName);
    await this.users.save(user);
    return user;
  }

  async getById(id: string) {
    return await this.users.findById(id);
  }

  async changeDisplayName(id: string, newName: string) {
    const user = await this.users.findById(id);
    if (!user) throw new Error("User not found");
    user.changeDisplayName(newName);
    await this.users.save(user);
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new Error("User not found");
    user.softDelete();
    await this.users.delete(user.id);
  }

  async recordConsent(
    userId: string,
    code: "tos" | "privacy" | "marketing",
    version: string,
    grantedAt: Date,
  ) {
    const consent = Consent.record(userId, code, version, grantedAt);
    await this.consents.append(consent);
    return consent;
  }

  async getConsents(userId: string) {
    return await this.consents.listByUser(userId);
  }
}
