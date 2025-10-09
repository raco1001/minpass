import { Module } from "@nestjs/common";

import { UsersClientService } from "./users.client.service";
import { UsersClientServicePort } from "@apis/core/ports/in/users.client.service.port";
import { UsersGrpcClientModule } from "@apis/infrastructure/grpc/clients/users/users.grpc.client.module";

@Module({
  imports: [UsersGrpcClientModule],
  exports: [UsersClientServicePort],
  providers: [
    {
      provide: UsersClientServicePort,
      useClass: UsersClientService,
    },
    UsersClientService,
  ],
})
export class ServiceModule {}
