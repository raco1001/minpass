import { Inject, Injectable } from "@nestjs/common";
import { USERS_SERVICE_CLIENT } from "./users.grpc.client.constants";
import { users } from "@app/contracts";
import { Observable } from "rxjs";
import { UsersQueryPort } from "@apis/core/ports/out/users.query.port";
import { UsersCommandPort } from "@apis/core/ports/out/users.command.port";

@Injectable()
export class UsersGrpcClientAdapter
  implements UsersQueryPort, UsersCommandPort
{
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

  findAllUsers(): Observable<users.UserList> {
    return this.client.findAllUsers({});
  }

  findOneUser(request: users.FindOneUserRequest): Observable<users.User> {
    return this.client.findOneUser(request);
  }
}
