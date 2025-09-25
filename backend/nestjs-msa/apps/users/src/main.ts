import { join } from "path";

import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";

import { UsersModule } from "./users.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.GRPC,
      options: {
        package: "users.v1",
        protoPath: [
          join(process.cwd(), "libs/contracts/proto/users/v1/users.proto"),
          join(process.cwd(), "libs/contracts/proto/users/v1/consents.proto"),
        ],
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          oneofs: true,
        },
      },
    },
  );
  await app.listen();
}
bootstrap();
