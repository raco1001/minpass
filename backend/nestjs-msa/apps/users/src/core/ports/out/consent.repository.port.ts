import { Consent } from "../../domain/entities/consent.entity";

export const IConsentRepository = Symbol("IConsentRepository");

export interface IConsentRepository {
  listByUser(userId: string): Promise<Consent[]>;
  append(consent: Consent): Promise<void>;
}
