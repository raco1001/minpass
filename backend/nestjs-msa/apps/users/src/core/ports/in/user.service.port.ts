import { User } from "../../domain/entities/user.entity";
import { Consent } from "../../domain/entities/consent.entity";

export const IUserService = Symbol("IUserService");

export interface IUserService {
  register(email: string, displayName?: string): Promise<User>;
  getById(id: string): Promise<User | null>;
  changeDisplayName(id: string, newName: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  recordConsent(
    userId: string,
    code: string,
    version: string,
    grantedAt: Date,
  ): Promise<Consent>;
  getConsents(userId: string): Promise<Consent[]>;
}
