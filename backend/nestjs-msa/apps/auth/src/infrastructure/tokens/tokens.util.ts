import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TokensUtil {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateToken(
    user: { userId: string; email: string },
    isAccessToken: boolean,
  ): string {
    const payload = {
      userId: user.userId,
      email: user.email,
      type: isAccessToken ? "access" : "refresh",
    };

    const secret = isAccessToken
      ? this.configService.get("JWT_SECRET")
      : this.configService.get("REFRESH_TOKEN_SECRET");

    const expiresIn = isAccessToken
      ? this.configService.get("JWT_EXPIRATION", "15m")
      : this.configService.get("REFRESH_TOKEN_EXPIRATION", "7d");

    const token: string = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
    return token;
  }
}
