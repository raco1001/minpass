import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ExtractUserIdGuard } from "./extract-user-id.guard";

/**
 * AuthModule
 *
 * JWT 토큰 검증 및 userId 추출 관련 기능을 제공합니다.
 *
 * 제공 기능:
 * - ExtractUserIdGuard: JWT 토큰 검증 및 userId 추출
 * - @Auth() Decorator: Guard 적용 데코레이터
 * - AuthenticatedRequest: 타입 안정성을 위한 인터페이스
 */
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
    }),
  ],
  providers: [ExtractUserIdGuard],
  exports: [ExtractUserIdGuard, JwtModule],
})
export class AuthModule {}
