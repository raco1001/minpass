import { Module } from "@nestjs/common";
import { TokensUtil } from "./tokens.util";
import { Tokens } from "./tokens";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthTokenPort } from "@auth/core/ports/out/auth.token.port";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TokensUtil, { provide: AuthTokenPort, useClass: Tokens }],
  exports: [TokensUtil, AuthTokenPort],
})
export class TokensModule {}
