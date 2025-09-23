import { NestFactory } from "@nestjs/core";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { UsersModule } from "./users.module";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersModule,
    {
      transport: Transport.GRPC,
      options: {
        package: "users.v1",
        protoPath: join(process.cwd(), "proto/users/v1/users.proto"),
        url: "0.0.0.0:50051",
      },
    },
  );
  await app.listen();
}
bootstrap();
