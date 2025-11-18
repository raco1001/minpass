import { Observable } from "rxjs";

import {
  FindOneUserRequest,
  User,
  UserList,
  UsersServiceClient,
} from "@app/contracts/generated/users/v1/users";

export abstract class UsersQueryPort implements Partial<UsersServiceClient> {
  abstract findMeUser(userId: string): Observable<User>;
  abstract findAllUsers(): Observable<UserList>;
  abstract findOneUser(request: FindOneUserRequest): Observable<User>;
}
