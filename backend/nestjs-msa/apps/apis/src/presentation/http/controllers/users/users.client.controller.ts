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

import { UsersClientServicePort } from "@apis/core/ports/in/users.client.service.port";

@Controller("users")
export class UsersClientController {
  constructor(
    @Inject(UsersClientServicePort)
    private readonly usersService: UsersClientServicePort,
  ) {}

  @Post()
  createUser(@Body() request: users.CreateUserRequest): Observable<users.User> {
    return this.usersService.createUser(request);
  }

  @Get()
  findAllUsers(): Observable<users.UserList> {
    return this.usersService.findAllUsers();
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
    return this.usersService.deleteUser({ id });
  }
}
