import { Controller, Get, Inject } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";

import { Empty } from "../../../../../../libs/contracts/generated/google/protobuf/empty";
import {
  CreateUserRequest,
  FindOneUserRequest,
  UpdateUserRequest,
  User,
  UserList,
  UsersServiceClient,
} from "../../../../../../libs/contracts/generated/users/v1/users";
import { MICROSERVICE_CLIENTS } from "../../../core/domain/constants/services.constant";

@Controller("users")
export class UsersClientController implements UsersServiceClient {
  constructor(
    @Inject(MICROSERVICE_CLIENTS.USERS_SERVICE)
    private client: ClientGrpc,
  ) {}

  @Get()
  findAllUsers(request: Empty): Observable<UserList> {
    return this.client
      .getService<UsersServiceClient>("UserService")
      .findAllUsers(request);
  }
  createUser(request: CreateUserRequest): Observable<User> {
    return this.client
      .getService<UsersServiceClient>("UserService")
      .createUser(request);
  }
  findOneUser(request: FindOneUserRequest): Observable<User> {
    return this.client
      .getService<UsersServiceClient>("UserService")
      .findOneUser(request);
  }
  updateUser(request: UpdateUserRequest): Observable<User> {
    return this.client
      .getService<UsersServiceClient>("UserService")
      .updateUser(request);
  }
  removeUser(request: FindOneUserRequest): Observable<User> {
    return this.client
      .getService<UsersServiceClient>("UserService")
      .removeUser(request);
  }
}
