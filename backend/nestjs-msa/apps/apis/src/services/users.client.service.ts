import { Inject, Injectable } from "@nestjs/common";
import { UsersClientServicePort } from "../core/ports/in/users.client.service.port";
import { UsersQueryPort } from "@apis/core/ports/out/users.query.port";
import { Observable } from "rxjs";
import { users } from "@app/contracts";
import { UsersCommandPort } from "@apis/core/ports/out/users.command.port";

@Injectable()
export class UsersClientService implements UsersClientServicePort {
  constructor(
    @Inject(UsersQueryPort)
    private readonly usersQuery: UsersQueryPort,
    @Inject(UsersCommandPort)
    private readonly usersCommand: UsersCommandPort,
  ) {}

  createUser(request: users.CreateUserRequest): Observable<users.User> {
    return this.usersCommand.createUser(request);
  }

  updateUser(request: users.UpdateUserRequest): Observable<users.User> {
    return this.usersCommand.updateUser(request);
  }

  deleteUser(request: users.FindOneUserRequest): Observable<users.User> {
    return this.usersCommand.deleteUser(request);
  }

  findAllUsers(): Observable<users.UserList> {
    return this.usersQuery.findAllUsers();
  }

  findOneUser(request: users.FindOneUserRequest): Observable<users.User> {
    return this.usersQuery.findOneUser(request);
  }
}
