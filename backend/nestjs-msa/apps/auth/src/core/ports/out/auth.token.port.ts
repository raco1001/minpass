import { User } from "@/core/users/core/domain/entities/user.entity";
import { OAuthClient } from "../../domain/entities/oauth-client.entity";
import { ILoginResult } from "../../domain/types/login-result.interface";

export const ITokenHandlerPort = Symbol("ITokenHandlerPort");
export interface ITokenHandlerPort extends Partial<ILoginResult> {
  refreshAccessToken(
    user: User,
    oauthClient: OAuthClient,
  ): Promise<ILoginResult>;
  generateTokens(user: User, oauthClient: OAuthClient): Promise<ILoginResult>;
}
