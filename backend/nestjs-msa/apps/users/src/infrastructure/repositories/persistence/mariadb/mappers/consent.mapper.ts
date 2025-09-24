import { Purpose } from "../../../../../core/domain/constants/consent.constants";
import { Consent } from "../../../../../core/domain/entities/consent.entity";
import { ConsentRow } from "../schema/consents";

export const toDomainConsent = (row: ConsentRow): Consent =>
  Consent.restore({
    id: row.id,
    userId: row.userId,
    purpose: row.purpose as Purpose,
    scope: row.scope as string,
    grantedAt: row.grantedAt as Date,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    revokedAt: row.revokedAt ?? null,
  });

export const toRowConsent = (c: Consent): ConsentRow => ({
  id: c.data.id,
  userId: c.data.userId,
  purpose: c.data.purpose,
  scope: c.data.scope,
  createdAt: new Date(c.data.createdAt),
  grantedAt: c.data.grantedAt,
  updatedAt: new Date(c.data.updatedAt),
  revokedAt: c.data.revokedAt ?? null,
});
