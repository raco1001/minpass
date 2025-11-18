import { Module } from "@nestjs/common";

import { UsersClientService } from "./users.client.service";
import { UsersClientServicePort } from "@apis/core/ports/in/users.client.service.port";
import { AuthClientServicePort } from "@apis/core/ports/in/auth.client.service.port";
import { UsersGrpcClientModule } from "@apis/infrastructure/grpc/clients/users/users.grpc.client.module";
import { AuthGrpcClientModule } from "@apis/infrastructure/grpc/clients/auth/auth.grpc.client.module";
import { AuthClientService } from "./auth.client.service";

@Module({
  imports: [UsersGrpcClientModule, AuthGrpcClientModule],
  exports: [UsersClientServicePort, AuthClientServicePort],
  providers: [
    {
      provide: UsersClientServicePort,
      useClass: UsersClientService,
    },
    {
      provide: AuthClientServicePort,
      useClass: AuthClientService,
    },
  ],
})
export class ServiceModule {}
