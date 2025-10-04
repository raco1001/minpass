import { Inject, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

import {
  CreateUserRequest,
  FindOneUserRequest,
  User,
  UsersServiceClient,
  UsersServiceControllerMethods,
} from "@contracts/generated/users/v1/users";

import { USERS_SERVICE_CLIENT } from "./users-client.constants";
import { UserClientPort } from "@src/core/ports/out/user-client.port";

@Injectable()
export class UsersClientService implements UserClientPort {
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly usersService: UsersServiceClient,
  ) {}

  createUser(request: CreateUserRequest): Observable<User> {
    return this.usersService.createUser(request);
  }

  findOneUser(request: FindOneUserRequest): Observable<User> {
    return this.usersService.findOneUser(request);
  }
}
