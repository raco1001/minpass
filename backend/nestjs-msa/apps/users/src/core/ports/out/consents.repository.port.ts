import { Consent } from "@src/core/domain/entities/consent.entity";

export abstract class ConsentsRepositoryPort {
  abstract listByUser(userId: string): Promise<Consent[]>;
  abstract append(consent: Consent): Promise<void>;
}
