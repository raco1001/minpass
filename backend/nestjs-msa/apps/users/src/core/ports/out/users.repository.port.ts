import { User } from "@users/core/domain/entities/user.entity";

export abstract class UsersRepositoryPort {
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract update(user: User): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findAll(): Promise<User[]>;
}
