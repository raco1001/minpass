import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";

import { users } from "@app/contracts";

import { UsersServicePort } from "@users/core/ports/in/users.service.port";

import { UsersControllerMapper } from "./users.controller.mapper";

@users.UsersServiceControllerMethods()
@Controller()
export class UsersController implements users.UsersServiceController {
  constructor(
    @Inject(UsersServicePort)
    @Inject(users.USERS_V1_PACKAGE_NAME)
    private readonly usersService: UsersServicePort,
  ) {}
  @GrpcMethod("UsersService", "CreateUser")
  async createUser(data: users.CreateUserRequest): Promise<users.User> {
    console.log("CreateUser called with:", data);
    const createUserDto = UsersControllerMapper.toCreateUserDto(data);
    return this.usersService
      .register(createUserDto)
      .then((user) => UsersControllerMapper.toUserResponse(user));
  }

  @GrpcMethod("UsersService", "FindAllUsers")
  async findAllUsers(): Promise<users.UserList> {
    console.log("FindAllUsers called");
    return this.usersService
      .findAll()
      .then((users) => UsersControllerMapper.toUserListResponse(users));
  }

  @GrpcMethod("UsersService", "FindOneUser")
  async findOneUser(data: users.FindOneUserRequest): Promise<users.User> {
    console.log("FindOneUser called with:", data);
    return this.usersService
      .getById(UsersControllerMapper.toFindOneUserDto(data))
      .then((user) => UsersControllerMapper.toUserResponse(user!));
  }

  @GrpcMethod("UsersService", "UpdateUser")
  async updateUser(data: users.UpdateUserRequest): Promise<users.User> {
    console.log("UpdateUser called with:", data);
    return this.usersService
      .changeDisplayName(UsersControllerMapper.toUpdateUserDto(data))
      .then((user) => UsersControllerMapper.toUserResponse(user));
  }

  @GrpcMethod("UsersService", "RemoveUser")
  async removeUser(data: users.FindOneUserRequest): Promise<users.User> {
    console.log("RemoveUser called with:", data);
    const user = await this.usersService.getById(
      UsersControllerMapper.toFindOneUserDto(data),
    );
    await this.usersService.deleteUser(
      UsersControllerMapper.toFindOneUserDto(data),
    );
    return UsersControllerMapper.toUserResponse(user!);
  }

  @GrpcMethod("ConsentsService", "RecordConsent")
  async recordConsent(
    data: users.RecordConsentRequest,
  ): Promise<users.Consent> {
    console.log("RecordConsent called with:", data);
    const createConsentDto = UsersControllerMapper.toCreateConsentDto(data);
    const consent = await this.usersService.recordConsent(createConsentDto);
    return UsersControllerMapper.toConsentResponse(consent);
  }

  @GrpcMethod("ConsentsService", "ListConsents")
  async listConsents(
    data: users.FindOneUserRequest,
  ): Promise<users.ConsentList> {
    console.log("ListConsents called with:", data);
    const consents = await this.usersService.getConsents(
      UsersControllerMapper.toFindOneUserDto(data),
    );
    return UsersControllerMapper.toConsentsResponse(consents);
  }
}
