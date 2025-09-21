import { NestFactory } from "@nestjs/core";
import { ApisModule } from "./apis.module";

async function bootstrap() {
  const app = await NestFactory.create(ApisModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
