import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

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
    const token: string = this.jwtService.sign(payload, {
      secret: isAccessToken
        ? this.configService.get("JWT_SECRET")
        : this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: isAccessToken ? 3600 : 7 * 24 * 3600, // access: 1시간, refresh: 7일
    });
    return token;
  }
}
