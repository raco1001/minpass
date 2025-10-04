import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { ILoginResult } from "@src/presentation/web/dtos/login-result.interface";
import { User } from "@contracts/generated/users/v1/users";
export abstract class TokenHandlerPort {
  abstract refreshAccessToken(
    user: User,
    oauthClient: OAuthClient,
  ): Promise<ILoginResult>;
  abstract generateTokens(
    user: User,
    oauthClient: OAuthClient,
  ): Promise<ILoginResult>;
}
