import {
  CreateUserRequest,
  FindOneUserRequest,
  User,
  UsersServiceClient,
} from "@contracts/generated/users/v1/users";
import { Observable } from "rxjs";

export interface IUserClientPort extends Partial<UsersServiceClient> {
  createUser(request: CreateUserRequest): Observable<User>;
  findOneUser(request: FindOneUserRequest): Observable<User>;
}

export const IUserClientPort = Symbol("IUserClientPort");
