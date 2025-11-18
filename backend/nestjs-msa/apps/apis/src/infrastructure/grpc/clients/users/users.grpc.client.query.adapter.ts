import { Inject, Injectable } from "@nestjs/common";
import { USERS_SERVICE_CLIENT } from "./users.grpc.client.constants";
import { users } from "@app/contracts";
import { Observable } from "rxjs";
import { UsersQueryPort } from "@apis/core/ports/out/users.query.port";

@Injectable()
export class UsersGrpcClientQueryAdapter implements UsersQueryPort {
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly client: users.UsersServiceClient,
  ) {}

  findOneUser(request: users.FindOneUserRequest): Observable<users.User> {
    return this.client.findOneUser(request);
  }

  findAllUsers(): Observable<users.UserList> {
    return this.client.findAllUsers({});
  }

  findMeUser(userId: string): Observable<users.User> {
    return this.findOneUser({ id: userId });
  }
}
