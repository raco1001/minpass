import * as fs from "fs";
import { join } from "path";

import { ServerCredentials } from "@grpc/grpc-js";
import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

import { UsersModule } from "./users.module";
async function bootstrap() {
  const ca = fs.readFileSync(process.env.CA_CERT_PATH!);
  const key = fs.readFileSync(process.env.SERVER_KEY_PATH!);
  const cert = fs.readFileSync(process.env.SERVER_CERT_PATH!);

  const creds = ServerCredentials.createSsl(
    ca,
    [{ private_key: key, cert_chain: cert }],
    true,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.GRPC,
      options: {
        url: process.env.USERS_GRPC_BIND_URL || "0.0.0.0:4001",
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
        credentials: creds,
      },
    },
  );
  app.enableShutdownHooks();
  await app.listen();
}
bootstrap();
