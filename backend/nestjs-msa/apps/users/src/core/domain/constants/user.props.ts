import { UserStatus } from "./user.constants";

export interface IUserProps {
  id: string;
  email: string;
  displayName?: string | null;
  status: UserStatus;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
