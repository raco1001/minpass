import { OAuthClient } from "@src/core/domain/entities/oauth-client.entity";
import { ILoginResult } from "@src/presentation/grpc/dtos/login-result.interface";
import { User } from "@contracts/generated/users/v1/users";

export const ITokenHandlerPort = Symbol("ITokenHandlerPort");
export interface ITokenHandlerPort extends Partial<ILoginResult> {
  refreshAccessToken(
    user: User,
    oauthClient: OAuthClient,
  ): Promise<ILoginResult>;
  generateTokens(user: User, oauthClient: OAuthClient): Promise<ILoginResult>;
}
