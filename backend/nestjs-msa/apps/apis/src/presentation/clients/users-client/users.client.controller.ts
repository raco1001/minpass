import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { Observable } from "rxjs";

import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserList,
  UsersServiceClient,
} from "../../../../../../libs/contracts/generated/users/v1/users";

import { USERS_SERVICE_CLIENT } from "./users-client.constants";

@Controller("users")
export class UsersClientController {
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly usersService: UsersServiceClient,
  ) {}

  @Post()
  createUser(@Body() request: CreateUserRequest): Observable<User> {
    return this.usersService.createUser(request);
  }

  @Get()
  findAllUsers(): Observable<UserList> {
    return this.usersService.findAllUsers({});
  }

  @Get(":id")
  findOneUser(@Param("id") id: string): Observable<User> {
    return this.usersService.findOneUser({ id });
  }

  @Patch(":id")
  updateUser(
    @Param("id") id: string,
    @Body() request: Omit<UpdateUserRequest, "id">,
  ): Observable<User> {
    return this.usersService.updateUser({ id, ...request });
  }

  @Delete(":id")
  removeUser(@Param("id") id: string): Observable<User> {
    return this.usersService.removeUser({ id });
  }
}
