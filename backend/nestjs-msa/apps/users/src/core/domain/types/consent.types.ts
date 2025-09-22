import { Purpose } from "../constants/consent.constants";

export interface IConsentProps {
  id: string;
  userId: string;
  purpose: Purpose;
  scope: string;
  grantedAt: Date;
  revokedAt?: Date | null;
  payloadHash?: string;
}
