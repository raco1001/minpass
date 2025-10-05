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

import { users } from "@app/contracts";

import { USERS_SERVICE_CLIENT } from "./users-client.constants";

@Controller("users")
export class UsersClientController {
  constructor(
    @Inject(USERS_SERVICE_CLIENT)
    private readonly usersService: users.UsersServiceClient,
  ) {}

  @Post()
  createUser(@Body() request: users.CreateUserRequest): Observable<users.User> {
    return this.usersService.createUser(request);
  }

  @Get()
  findAllUsers(): Observable<users.UserList> {
    return this.usersService.findAllUsers({});
  }

  @Get(":id")
  findOneUser(@Param("id") id: string): Observable<users.User> {
    return this.usersService.findOneUser({ id });
  }

  @Patch(":id")
  updateUser(
    @Param("id") id: string,
    @Body() request: Omit<users.UpdateUserRequest, "id">,
  ): Observable<users.User> {
    return this.usersService.updateUser({ id, ...request });
  }

  @Delete(":id")
  removeUser(@Param("id") id: string): Observable<users.User> {
    return this.usersService.removeUser({ id });
  }
}
