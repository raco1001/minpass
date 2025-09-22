import { User } from "../../../../../core/domain/entities/user.entity";
import { UserStatus } from "../../../../../core/domain/constants/user.constants";
import { UserRow } from "../schema/users";

export const toDomainUser = (row: UserRow): User => {
  return User.restore({
    id: row.id,
    email: row.email,
    displayName: row.displayName ?? undefined,
    status: row.status as UserStatus,
    locale: row.locale,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    deletedAt: row.deletedAt,
  });
};

export const toRowUser = (
  user: User,
): Omit<UserRow, "createdAt" | "updatedAt"> &
  Partial<Pick<UserRow, "createdAt" | "updatedAt">> => {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName ?? null,
    status: user.status,
    locale: user.locale,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    deletedAt: user.deletedAt ? new Date(user.deletedAt) : null,
  };
};
