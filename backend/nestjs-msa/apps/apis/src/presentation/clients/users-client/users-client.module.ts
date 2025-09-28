import { join } from "path";

import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { MICROSERVICE_CLIENTS } from "../../../core/domain/constants/services.constant";

import { UsersClientController } from "./users.client.controller";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICE_CLIENTS.USERS_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: ["users.v1"],
          protoPath: ["users/v1/users.proto", "users/v1/consents.proto"],
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
            includeDirs: [join(process.cwd(), "libs/contracts/proto")],
          },
          url: "0.0.0.0:4001",
        },
      },
    ]),
  ],
  controllers: [UsersClientController],
})
export class UsersClientModule {}
