import { Controller, Inject } from "@nestjs/common";
import { IUserService } from "../../../core/ports/in/user.service.port";
import { GrpcMethod } from "@nestjs/microservices";
import {
  CreateUserDto,
  FindOneUserDto,
  UpdateUserDto,
} from "../../../core/dtos/user.dtos";
import { IUserProps } from "../../../core/domain/constants/user.props";

@Controller()
export class UsersController {
  constructor(
    @Inject(IUserService)
    private readonly usersService: IUserService,
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
}
