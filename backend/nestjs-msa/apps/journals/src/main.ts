import { NestFactory } from "@nestjs/core";
import { JournalsModule } from "./journals.module";

async function bootstrap() {
  const app = await NestFactory.create(JournalsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
