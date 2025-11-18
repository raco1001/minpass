import {
  CreateUserRequest,
  FindOneUserRequest,
  UpdateUserRequest,
  User,
  UserList,
} from "@app/contracts/generated/users/v1/users";
import { Observable } from "rxjs";

export abstract class UsersClientServicePort {
  abstract createUser(request: CreateUserRequest): Observable<User>;
  abstract updateUser(request: UpdateUserRequest): Observable<User>;
  abstract deleteUser(request: FindOneUserRequest): Observable<User>;
  abstract findMeUser(userId: string): Observable<User>;
  abstract findOneUser(request: FindOneUserRequest): Observable<User>;
  abstract findAllUsers(): Observable<UserList>;
}
