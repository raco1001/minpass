import { Consent } from "../../../../../core/domain/entities/consent.entity";
import {
  binToUuid,
  uuidToBin,
} from "../../../../../../../../libs/global/utils/id-util/convertUuid";

export type ConsentRow = {
  id: Buffer;
  userId: Buffer;
  purpose: "tos" | "privacy" | "marketing";
  scope: string;
  grantedAt: Date;
  revokedAt: Date | null;
  payloadHash: string | null;
};

export const toDomainConsent = (row: ConsentRow): Consent =>
  Consent.restore({
    id: binToUuid(row.id),
    userId: binToUuid(row.userId),
    purpose: row.purpose,
    scope: row.scope,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt ?? null,
    payloadHash: row.payloadHash ?? undefined,
  });

export const toRowConsent = (c: Consent): ConsentRow => ({
  id: uuidToBin(c.data.id),
  userId: uuidToBin(c.data.userId),
  purpose: c.data.purpose,
  scope: c.data.scope,
  grantedAt: c.data.grantedAt,
  revokedAt: c.data.revokedAt ?? null,
  payloadHash: c.data.payloadHash ?? null,
});
