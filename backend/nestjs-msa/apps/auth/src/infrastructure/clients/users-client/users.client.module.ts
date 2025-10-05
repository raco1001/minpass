import * as fs from "fs";
import { join, resolve } from "path";

import { credentials as GrpcCreds } from "@grpc/grpc-js";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientGrpc, ClientsModule, Transport } from "@nestjs/microservices";

import { users } from "@app/contracts";

import { USERS_SERVICE_CLIENT } from "./users-client.constants";
import { UsersClientService } from "./users-client.service";

const fromRoot = (p: string) => resolve(process.cwd(), p);

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: "USERS_CLIENT",
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
              package: users.protobufPackage,
              protoPath: join(__dirname, "../users/v1/users.proto"),
              loader: {
                keepCase: false,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
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
        client.getService<users.UsersServiceClient>(users.USERS_SERVICE_NAME),
      inject: ["USERS_CLIENT"],
    },
    UsersClientService,
  ],
  exports: [USERS_SERVICE_CLIENT, UsersClientService],
})
export class UsersClientModule {}
