import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";

import {
  Consent,
  ConsentList,
  RecordConsentRequest,
} from "@contracts/generated/users/v1/consents";
import {
  CreateUserRequest,
  FindOneUserRequest,
  UpdateUserRequest,
  User,
  UserList,
  UsersServiceController,
  UsersServiceControllerMethods,
  USERS_V1_PACKAGE_NAME,
} from "@contracts/generated/users/v1/users";
import { IUsersServicePort } from "@src/core/ports/in/users.service.port";

import { UsersControllerMapper } from "./users.controller.mapper";

@UsersServiceControllerMethods()
@Controller()
export class UsersController implements UsersServiceController {
  constructor(
    @Inject(IUsersServicePort)
    @Inject(USERS_V1_PACKAGE_NAME)
    private readonly usersService: IUsersServicePort,
  ) {}
  @GrpcMethod("UsersService", "CreateUser")
  async createUser(data: CreateUserRequest): Promise<User> {
    console.log("CreateUser called with:", data);
    const createUserDto = UsersControllerMapper.toCreateUserDto(data);
    return this.usersService
      .register(createUserDto)
      .then((user) => UsersControllerMapper.toUserResponse(user));
  }

  @GrpcMethod("UsersService", "FindAllUsers")
  async findAllUsers(): Promise<UserList> {
    console.log("FindAllUsers called");
    return this.usersService
      .findAll()
      .then((users) => UsersControllerMapper.toUserListResponse(users));
  }

  @GrpcMethod("UsersService", "FindOneUser")
  async findOneUser(data: FindOneUserRequest): Promise<User> {
    console.log("FindOneUser called with:", data);
    return this.usersService
      .getById(UsersControllerMapper.toFindOneUserDto(data))
      .then((user) => UsersControllerMapper.toUserResponse(user!));
  }

  @GrpcMethod("UsersService", "UpdateUser")
  async updateUser(data: UpdateUserRequest): Promise<User> {
    console.log("UpdateUser called with:", data);
    return this.usersService
      .changeDisplayName(UsersControllerMapper.toUpdateUserDto(data))
      .then((user) => UsersControllerMapper.toUserResponse(user));
  }

  @GrpcMethod("UsersService", "RemoveUser")
  async removeUser(data: FindOneUserRequest): Promise<User> {
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
  async recordConsent(data: RecordConsentRequest): Promise<Consent> {
    console.log("RecordConsent called with:", data);
    const createConsentDto = UsersControllerMapper.toCreateConsentDto(data);
    const consent = await this.usersService.recordConsent(createConsentDto);
    return UsersControllerMapper.toConsentResponse(consent);
  }

  @GrpcMethod("ConsentsService", "ListConsents")
  async listConsents(data: FindOneUserRequest): Promise<ConsentList> {
    console.log("ListConsents called with:", data);
    const consents = await this.usersService.getConsents(
      UsersControllerMapper.toFindOneUserDto(data),
    );
    return UsersControllerMapper.toConsentsResponse(consents);
  }
}
