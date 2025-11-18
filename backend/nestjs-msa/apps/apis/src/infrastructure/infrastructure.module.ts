import { Module } from "@nestjs/common";

import { GrpcClientsModule } from "./grpc/grpc-clients.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [GrpcClientsModule, AuthModule],
  exports: [GrpcClientsModule, AuthModule],
})
export class InfrastructureModule {}
