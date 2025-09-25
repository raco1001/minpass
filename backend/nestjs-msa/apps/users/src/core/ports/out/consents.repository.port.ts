import { Consent } from "../../domain/entities/consent.entity";

export const IConsentsRepositoryPort = Symbol("IConsentsRepositoryPort");

export interface IConsentsRepositoryPort {
  listByUser(userId: string): Promise<Consent[]>;
  append(consent: Consent): Promise<void>;
}
