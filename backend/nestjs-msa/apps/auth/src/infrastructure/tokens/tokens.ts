import { User } from "@app/contracts/generated/users/v1/users";
import { TokensEntity } from "@auth/core/domain/entities/token.entity";
import { AuthTokenPort } from "@auth/core/ports/out/auth.token.port";
import { Injectable } from "@nestjs/common";
import { TokensUtil } from "./tokens.util";

@Injectable()
export class Tokens implements AuthTokenPort {
  constructor(private readonly tokensUtil: TokensUtil) {}
  async generateTokens(userInfo: {
    userId: User["id"];
    email: User["email"];
  }): Promise<TokensEntity> {
    const accessToken = this.tokensUtil.generateToken(userInfo, true);
    const refreshToken = this.tokensUtil.generateToken(userInfo, false);
    const tokens = new TokensEntity(accessToken, refreshToken);
    return tokens;
  }
}
