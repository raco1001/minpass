import { Module } from "@nestjs/common";

import { UsersGrpcClientModule } from "./clients/users/users.grpc.client.module";

@Module({
  imports: [UsersGrpcClientModule],
  exports: [UsersGrpcClientModule],
})
export class GrpcClientsModule {}
