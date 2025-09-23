import { Purpose } from "./consent.constants";

export interface IConsentProps {
  id: string;
  userId: string;
  purpose: Purpose;
  scope: string;
  grantedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date | null;
}
