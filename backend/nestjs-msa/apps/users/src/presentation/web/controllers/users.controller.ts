import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";

import { IConsentProps } from "../../../core/domain/constants/consent.props";
import { IUserProps } from "../../../core/domain/constants/user.props";
import { CreateConsentDto } from "../../../core/dtos/consent.dtos";
import {
  CreateUserDto,
  FindOneUserDto,
  UpdateUserDto,
} from "../../../core/dtos/user.dtos";
import { IUsersServicePort } from "../../../core/ports/in/users.service.port";

@Controller()
export class UsersController {
  constructor(
    @Inject(IUsersServicePort)
    private readonly usersService: IUsersServicePort,
  ) {}
  @GrpcMethod("UsersService", "CreateUser")
  createUser(data: CreateUserDto): Promise<IUserProps | null> {
    console.log("CreateUser called with:", data);
    return this.usersService.register(data);
  }

  @GrpcMethod("UsersService", "FindAllUsers")
  findAllUsers(): Promise<IUserProps[]> {
    console.log("FindAllUsers called");
    return Promise.resolve([]);
  }

  @GrpcMethod("UsersService", "FindOneUser")
  findOneUser(data: FindOneUserDto): Promise<IUserProps | null> {
    console.log("FindOneUser called with:", data);
    return this.usersService.getById(data);
  }

  @GrpcMethod("UsersService", "UpdateUser")
  updateUser(data: UpdateUserDto): Promise<IUserProps | null> {
    console.log("UpdateUser called with:", data);
    return this.usersService.changeDisplayName(data);
  }

  @GrpcMethod("UsersService", "RemoveUser")
  async removeUser(data: FindOneUserDto): Promise<IUserProps | null> {
    console.log("RemoveUser called with:", data);
    const user = await this.usersService.getById(data);
    await this.usersService.deleteUser(data);
    return user;
  }

  @GrpcMethod("ConsentsService", "RecordConsent")
  async recordConsent(data: CreateConsentDto): Promise<IConsentProps | null> {
    console.log("RecordConsent called with:", data);
    const consent = await this.usersService.recordConsent(data);
    return consent.data;
  }

  @GrpcMethod("ConsentsService", "ListConsents")
  async listConsents(data: FindOneUserDto): Promise<IConsentProps[] | null> {
    console.log("ListConsents called with:", data);
    const consents = await this.usersService.getConsents(data);
    return consents.map((consent) => consent.data);
  }
}
