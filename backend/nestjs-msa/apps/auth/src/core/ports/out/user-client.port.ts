import {
  CreateUserRequest,
  FindOneUserRequest,
  User,
  UsersServiceClient,
} from "@app/contracts/generated/users/v1/users";
import { Observable } from "rxjs";

export abstract class UserClientPort implements Partial<UsersServiceClient> {
  abstract createUser(request: CreateUserRequest): Observable<User>;
  abstract findOneUser(request: FindOneUserRequest): Observable<User>;
}
