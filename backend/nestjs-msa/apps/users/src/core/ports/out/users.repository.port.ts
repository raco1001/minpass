import { User } from "../../domain/entities/user.entity";

export const IUsersRepositoryPort = Symbol("IUsersRepositoryPort");

export interface IUsersRepositoryPort {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
