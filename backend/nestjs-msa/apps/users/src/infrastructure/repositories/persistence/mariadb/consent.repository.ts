import { Injectable } from "@nestjs/common";
import { IConsentRepository } from "apps/users/src/core/ports/out/consent.repository.port";
import { Consent } from "apps/users/src/core/domain/entities/consent.entity";
import { createMariaDbProviders } from "../../../../../../../libs/integrations/database/mariadb/mariadb.provider";
import { toDomainConsent, toRowConsent } from "./mappers/consent.mapper";
import { consents } from "./schema/consents";
import { eq } from "drizzle-orm";
type DB = ReturnType<typeof createMariaDbProviders>;

@Injectable()
export class ConsentRepository implements IConsentRepository {
  constructor(private readonly db: DB) {}

  async listByUser(userId: string): Promise<Consent[]> {
    const consents = await this.db.query.consents
      .select()
      .from(consents)
      .where(eq(consents.userId, userId));
    return consents.map(toDomainConsent);
  }

  async append(consent: Consent): Promise<void> {
    await this.db.query.consents.insert(toRowConsent(consent));
  }
}
