import "tsconfig-paths/register";
import * as fs from "fs";
import { NestFactory } from "@nestjs/core";
import { join } from "path";
import { auth } from "@app/contracts";
import { AuthModule } from "./auth.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

import { ServerCredentials } from "@grpc/grpc-js";

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
    AuthModule,
    {
      transport: Transport.GRPC,
      options: {
        url: process.env.AUTH_GRPC_BIND_URL || "0.0.0.0:4002",
        package: auth.protobufPackage,
        protoPath: join(__dirname, "../auth/v1/auth.proto"),
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
          includeDirs: [join(__dirname, "../auth/v1")],
        },
        credentials: creds,
      },
    },
  );
  app.enableShutdownHooks();
  await app.listen();
}
bootstrap();
