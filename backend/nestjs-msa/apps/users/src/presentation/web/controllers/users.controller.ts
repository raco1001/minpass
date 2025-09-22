import { Controller } from "@nestjs/common";
import { IUserService } from "apps/users/src/core/ports/in/user.service.port";
import { GrpcMethod } from "@nestjs/microservices";

@Controller()
export class UsersController {
  constructor(private readonly usersService: IUserService) {}
  @GrpcMethod("UsersService", "getHello")
  getHello() {
    return "Hello World!";
  }

  @GrpcMethod("UsersService", "getUser")
  getUser(req: { id: string }) {
    return this.usersService.getById(req.id);
  }

  // @GrpcMethod("UsersService", "register")
  // register(req: { email: string; displayName?: string }) {
  //   return this.usersService.register(req.email, req.displayName);
  // }

  // @GrpcMethod("UsersService", "changeDisplayName")
  // changeDisplayName(req: { id: string; newName: string }) {
  //   return this.usersService.changeDisplayName(req.id, req.newName);
  // }

  // @GrpcMethod("UsersService", "deleteUser")
  // deleteUser(req: { id: string }) {
  //   return this.usersService.deleteUser(req.id);
  // }

  // @GrpcMethod("UsersService", "recordConsent")
  // recordConsent(req: {
  //   userId: string;
  //   code: string;
  //   version: string;
  //   grantedAt: Date;
  // }) {
  //   return this.usersService.recordConsent(
  //     req.userId,
  //     req.code,
  //     req.version,
  //     req.grantedAt,
  //   );
  // }

  // @GrpcMethod("UsersService", "getConsents")
  // getConsents(req: { userId: string }) {
  //   return this.usersService.getConsents(req.userId);
  // }
}
