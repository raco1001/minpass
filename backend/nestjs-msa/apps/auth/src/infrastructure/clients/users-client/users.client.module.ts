import * as fs from "fs";
import { resolve } from "path";

import { credentials as GrpcCreds } from "@grpc/grpc-js";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientGrpc, ClientsModule, Transport } from "@nestjs/microservices";

import {
  UsersServiceClient,
  USERS_SERVICE_NAME,
} from "@contracts/generated/users/v1/users";
import { MICROSERVICE_CLIENTS } from "@common/config/services.constant";

import { USERS_SERVICE_CLIENT } from "./users-client.constants";
import { UsersClientService } from "./users-client.service";

const fromRoot = (p: string) => resolve(process.cwd(), p);

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENTS.USERS_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => {
          const caPath = cfg.get<string>("CA_CERT_PATH", "libs/common/ca.crt");
          const keyPath = cfg.get<string>(
            "CLIENT_KEY_PATH",
            "libs/common/certs/client.key",
          );
          const certPath = cfg.get<string>(
            "CLIENT_CERT_PATH",
            "libs/common/certs/client.crt",
          );
          const targetUrl = cfg.get<string>(
            "USERS_GRPC_TARGET_URL",
            "127.0.0.1:4001",
          );

          const ca = fs.readFileSync(fromRoot(caPath));
          const clientKey = fs.readFileSync(fromRoot(keyPath));
          const clientCrt = fs.readFileSync(fromRoot(certPath));

          return {
            transport: Transport.GRPC,
            options: {
              url: targetUrl,
              package: ["users.v1"],
              protoPath: ["users/v1/users.proto", "users/v1/consents.proto"],
              loader: {
                keepCase: false,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [fromRoot("libs/contracts/proto")],
              },
              credentials: GrpcCreds.createSsl(ca, clientKey, clientCrt),
              channelOptions: {
                "grpc.keepalive_time_ms": 20_000,
                "grpc.keepalive_timeout_ms": 5_000,
                "grpc.max_receive_message_length": 20 * 1024 * 1024,
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [
    {
      provide: USERS_SERVICE_CLIENT,
      useFactory: (client: ClientGrpc) =>
        client.getService<UsersServiceClient>(USERS_SERVICE_NAME),
      inject: [MICROSERVICE_CLIENTS.USERS_SERVICE],
    },
    UsersClientService,
  ],
  exports: [USERS_SERVICE_CLIENT, UsersClientService],
})
export class UsersClientModule {}
