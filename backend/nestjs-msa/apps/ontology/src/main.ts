import { NestFactory } from '@nestjs/core';
import { OntologyModule } from './ontology.module';

async function bootstrap() {
  const app = await NestFactory.create(OntologyModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
