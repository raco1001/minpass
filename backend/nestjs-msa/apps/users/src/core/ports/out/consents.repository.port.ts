import { Consent } from "@src/core/domain/entities/consent.entity";

export const IConsentsRepositoryPort = Symbol("IConsentsRepositoryPort");

export interface IConsentsRepositoryPort {
  listByUser(userId: string): Promise<Consent[]>;
  append(consent: Consent): Promise<void>;
}
