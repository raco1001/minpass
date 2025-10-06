import * as fs from "fs";

import { credentials as GrpcCreds } from "@grpc/grpc-js";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientGrpc, ClientsModule, Transport } from "@nestjs/microservices";

import { users } from "@app/contracts";
import { MICROSERVICE_CLIENTS } from "@app/config";

import { USERS_SERVICE_CLIENT } from "./users.grpc.client.constants";
import { join, resolve } from "path";
import { UsersGrpcClientAdapter } from "./users.grpc.client.adapter";
import { UsersQueryPort } from "@apis/core/ports/out/users.query.port";
import { UsersCommandPort } from "@apis/core/ports/out/users.command.port";

const fromRoot = (p: string) => resolve(process.cwd(), p);

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_CLIENTS.USERS_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => {
          const caPath = cfg.get<string>("CA_CERT_PATH", "certs/ca.crt");
          const keyPath = cfg.get<string>(
            "CLIENT_KEY_PATH",
            "certs/client.key",
          );
          const certPath = cfg.get<string>(
            "CLIENT_CERT_PATH",
            "certs/client.crt",
          );
          const targetUrl = cfg.get<string>(
            "USERS_GRPC_TARGET_URL",
            "localhost:4001",
          );

          const ca = fs.readFileSync(fromRoot(caPath));
          const clientKey = fs.readFileSync(fromRoot(keyPath));
          const clientCert = fs.readFileSync(fromRoot(certPath));

          return {
            transport: Transport.GRPC,
            options: {
              url: targetUrl,
              package: ["users.v1"],
              protoPath: [join(__dirname, "../users/v1/users.proto")],
              loader: {
                keepCase: false,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
                includeDirs: [join(__dirname, "../users/v1")],
              },
              credentials: GrpcCreds.createSsl(ca, clientKey, clientCert),
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
      inject: [MICROSERVICE_CLIENTS.USERS_SERVICE],
    },
    {
      provide: UsersQueryPort,
      useClass: UsersGrpcClientAdapter,
    },
    {
      provide: UsersCommandPort,
      useClass: UsersGrpcClientAdapter,
    },
  ],
  exports: [UsersQueryPort, UsersCommandPort],
})
export class UsersGrpcClientModule {}
