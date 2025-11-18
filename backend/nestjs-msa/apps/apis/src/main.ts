import { NestFactory } from "@nestjs/core";
import { ApisModule } from "./apis.module";

async function bootstrap() {
  const app = await NestFactory.create(ApisModule);

  // CORS 설정
  app.enableCors({
    origin: [
      "http://localhost:5173", // Vite 기본 포트
      "http://localhost:5174", // 사용자의 실제 포트
      "http://localhost:3000", // 필요시 추가
    ],
    credentials: true, // 쿠키 등 자격 증명 허용
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  });

  // Global prefix 설정 (선택사항)
  // app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
