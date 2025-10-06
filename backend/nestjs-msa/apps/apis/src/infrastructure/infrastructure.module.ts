import { Module } from "@nestjs/common";

import { GrpcClientsModule } from "./grpc/grpc-clients.module";

@Module({
  imports: [GrpcClientsModule],
  exports: [GrpcClientsModule],
})
export class InfrastructureModule {}
