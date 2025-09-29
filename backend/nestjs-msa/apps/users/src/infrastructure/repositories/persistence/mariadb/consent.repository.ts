import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";

import { DRIZZLE_DB } from "@mariadb/constants/mariadb.constants";
import { Consent } from "@src/core/domain/entities/consent.entity";
import { IConsentsRepositoryPort } from "@src/core/ports/out/consents.repository.port";

import { toDomainConsent, toRowConsent } from "./mappers/consent.mapper";
import * as dbSchema from "./schema/consents";

@Injectable()
export class ConsentRepository implements IConsentsRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("users"))
    private readonly db: MySql2Database<typeof dbSchema>,
  ) {}

  async listByUser(userId: string): Promise<Consent[]> {
    const consents = await this.db
      .select()
      .from(dbSchema.consents)
      .where(eq(dbSchema.consents.userId, userId));
    return consents.map(toDomainConsent);
  }

  async append(consent: Consent): Promise<void> {
    await this.db.insert(dbSchema.consents).values(toRowConsent(consent));
  }
}
