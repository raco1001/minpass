import { join } from "path";

import { Module } from "@nestjs/common";
import { ClientGrpc, ClientsModule, Transport } from "@nestjs/microservices";

import {
  UsersServiceClient,
  USERS_SERVICE_NAME,
} from "../../../../../../libs/contracts/generated/users/v1/users";
import { MICROSERVICE_CLIENTS } from "../../../core/domain/constants/services.constant";

import { USERS_SERVICE_CLIENT } from "./users-client.constants";
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
  providers: [
    {
      provide: USERS_SERVICE_CLIENT,
      useFactory: (client: ClientGrpc) => {
        return client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
      },
      inject: [MICROSERVICE_CLIENTS.USERS_SERVICE],
    },
  ],
  controllers: [UsersClientController],
})
export class UsersClientModule {}
