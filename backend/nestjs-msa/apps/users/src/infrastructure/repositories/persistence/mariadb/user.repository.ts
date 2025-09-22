// apps/users/infrastructure/repositories/persistence/mariadb/user.repository.ts
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { DRIZZLE_DB } from "../../../../../../../libs/integrations/database/mariadb/constants/mariadb.constants";
import * as dbSchema from "./schema/users";
import { IUserRepository as UserRepositoryPort } from "../../../../core/ports/out/user.repository.port";
import { User } from "../../../../core/domain/entities/user.entity";
import { toDomainUser, toRowUser } from "./mappers/user.mapper";
import { UserStatus } from "apps/users/src/core/domain/constants/user.constants";

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @Inject(DRIZZLE_DB("users"))
    private readonly db: MySql2Database<typeof dbSchema>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return toDomainUser(rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(dbSchema.users)
      .where(eq(dbSchema.users.email, email))
      .limit(1);

    if (rows.length === 0) return null;
    return toDomainUser(rows[0]);
  }

  async save(user: User): Promise<void> {
    const row = toRowUser(user);
    await this.db
      .insert(dbSchema.users)
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
    await this.db
      .update(dbSchema.users)
      .set(row)
      .where(eq(dbSchema.users.id, row.id));
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(dbSchema.users)
      .set({
        status: UserStatus.Deleted,
        updatedAt: new Date(),
        deletedAt: new Date(),
      })
      .where(eq(dbSchema.users.id, id));
  }
}
