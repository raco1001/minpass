import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDb } from "@app/integrations/mariadb/constants/mariadb.types";

import { DRIZZLE_DB } from "@app/integrations/mariadb/constants/mariadb.constants";
import { Consent } from "@users/core/domain/entities/consent.entity";
import { ConsentsRepositoryPort } from "@users/core/ports/out/consents.repository.port";

import { toDomainConsent, toRowConsent } from "./mappers/consent.mapper";
import { consents } from "./schema/consents";

@Injectable()
export class ConsentRepository implements ConsentsRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("users"))
    private readonly db: DrizzleDb,
  ) {}

  async listByUser(userId: string): Promise<Consent[]> {
    const rows = await this.db
      .select()
      .from(consents)
      .where(eq(consents.userId, userId));
    return rows.map(toDomainConsent);
  }

  async append(consent: Consent): Promise<void> {
    await this.db.insert(consents).values(toRowConsent(consent));
  }
}
