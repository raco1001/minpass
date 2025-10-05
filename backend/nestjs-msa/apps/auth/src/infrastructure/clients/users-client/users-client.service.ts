import { Inject, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

import { users } from "@app/contracts";

import { USERS_SERVICE_CLIENT } from "./users-client.constants";
import { UserClientPort } from "@auth/core/ports/out/user-client.port";

@Injectable()
export class UsersClientService implements UserClientPort {
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly usersService: users.UsersServiceClient,
  ) {}

  createUser(request: users.CreateUserRequest): Observable<users.User> {
    return this.usersService.createUser(request);
  }

  findOneUser(request: users.FindOneUserRequest): Observable<users.User> {
    return this.usersService.findOneUser(request);
  }
}
