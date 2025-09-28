import { FindOneUserDto } from "../../dtos/user.dtos";

import { Purpose } from "./consent.constants";

export interface IConsentProps {
  id: string;
  userId: FindOneUserDto["id"];
  purpose: Purpose;
  scope: string;
  grantedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date | null;
}
