import { Module } from "@nestjs/common";

import { UsersGrpcClientModule } from "./clients/users/users.grpc.client.module";
import { AuthGrpcClientModule } from "./clients/auth/auth.grpc.client.module";

@Module({
  imports: [UsersGrpcClientModule, AuthGrpcClientModule],
  exports: [UsersGrpcClientModule, AuthGrpcClientModule],
})
export class GrpcClientsModule {}
