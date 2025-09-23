import { Inject, Injectable } from "@nestjs/common";
import { IConsentRepository } from "apps/users/src/core/ports/out/consent.repository.port";
import { Consent } from "apps/users/src/core/domain/entities/consent.entity";
import { toDomainConsent, toRowConsent } from "./mappers/consent.mapper";
import * as dbSchema from "./schema/consents";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { DRIZZLE_DB } from "../../../../../../../libs/integrations/database/mariadb/constants/mariadb.constants";

@Injectable()
export class ConsentRepository implements IConsentRepository {
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
