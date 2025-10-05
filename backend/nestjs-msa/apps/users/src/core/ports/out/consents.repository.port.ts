import { Consent } from "@users/core/domain/entities/consent.entity";

export abstract class ConsentsRepositoryPort {
  abstract listByUser(userId: string): Promise<Consent[]>;
  abstract append(consent: Consent): Promise<void>;
}
