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
  );
  await app.listen();
}
bootstrap();
