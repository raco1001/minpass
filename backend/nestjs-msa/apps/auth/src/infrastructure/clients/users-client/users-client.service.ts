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
import { IUserClientPort } from "@src/core/ports/out/user-client.port";

@UsersServiceControllerMethods()
@Injectable()
export class UsersClientService implements IUserClientPort {
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
