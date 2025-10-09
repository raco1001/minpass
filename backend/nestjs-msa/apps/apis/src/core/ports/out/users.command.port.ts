import {
  CreateUserRequest,
  FindOneUserRequest,
  UpdateUserRequest,
  User,
  UsersServiceClient,
} from "@app/contracts/generated/users/v1/users";
import { Observable } from "rxjs";

export abstract class UsersCommandPort implements Partial<UsersServiceClient> {
  abstract createUser(request: CreateUserRequest): Observable<User>;
  abstract updateUser(request: UpdateUserRequest): Observable<User>;
  abstract deleteUser(request: FindOneUserRequest): Observable<User>;
}
