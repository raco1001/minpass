import { NestFactory } from "@nestjs/core";

import { ActivitiesModule } from "./activities.module";

async function bootstrap() {
  const app = await NestFactory.create(ActivitiesModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
