// apps/users/infrastructure/repositories/persistence/mariadb/user.repository.ts
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDb } from "@mariadb/constants/mariadb.types";

import { DRIZZLE_DB } from "@mariadb/constants/mariadb.constants";
import { UserStatus } from "@src/core/domain/constants/user.constants";
import { User } from "@src/core/domain/entities/user.entity";
import { IUsersRepositoryPort } from "@src/core/ports/out/users.repository.port";

import { toDomainUser, toRowUser } from "./mappers/user.mapper";
import { users } from "./schema/users";
@Injectable()
export class UserRepository implements IUsersRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("users"))
    private readonly db: DrizzleDb,
  ) {}

  async findById(id: string): Promise<User | null> {
    const rows = await this.db.select().from(users).where(eq(users.id, id));

    if (rows.length === 0) return null;
    return toDomainUser(rows[0]);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.status, UserStatus.Active));
    return rows.map(toDomainUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (rows.length === 0) return null;
    return toDomainUser(rows[0]);
  }

  async save(user: User): Promise<void> {
    const row = toRowUser(user);
    await this.db
      .insert(users)
      .values(row)
      .onDuplicateKeyUpdate({
        set: {
          email: row.email,
          displayName: row.displayName ?? null,
          status: row.status,
          updatedAt: row.updatedAt!,
          deletedAt: row.deletedAt ?? null,
        },
      });
  }

  async update(user: User): Promise<void> {
    const row = toRowUser(user);
    await this.db.update(users).set(row).where(eq(users.id, row.id));
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        status: UserStatus.Deleted,
        updatedAt: new Date(),
        deletedAt: new Date(),
      })
      .where(eq(users.id, id));
  }
}
