import { UsersCommandPort } from "@apis/core/ports/out/users.command.port";
import { Inject, Injectable } from "@nestjs/common";
import { USERS_SERVICE_CLIENT } from "./users.grpc.client.constants";
import { users } from "@app/contracts";
import { Observable } from "rxjs";

@Injectable()
export class UsersGrpcClientCommandAdapter implements UsersCommandPort {
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly client: users.UsersServiceClient,
  ) {}

  createUser(request: users.CreateUserRequest): Observable<users.User> {
    return this.client.createUser(request);
  }

  updateUser(request: users.UpdateUserRequest): Observable<users.User> {
    return this.client.updateUser(request);
  }

  deleteUser(request: users.FindOneUserRequest): Observable<users.User> {
    return this.client.removeUser(request);
  }
}
