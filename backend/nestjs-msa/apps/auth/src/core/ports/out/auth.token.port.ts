import { ILoginResult } from "@auth/presentation/web/dtos/login-result.interface";
import { User } from "@app/contracts/generated/users/v1/users";
import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";

export abstract class TokenHandlerPort {
  abstract refreshAccessToken(
    user: User,
    oauthClient: AuthClientEntity,
  ): Promise<ILoginResult>;
  abstract generateTokens(
    user: User,
    authClient: AuthClientEntity,
    authToken: AuthTokenEntity,
  ): Promise<ILoginResult>;
}
