import { OAuthClient } from "@/core/auth/core/domain/entities/oauth-client.entity";
import { OAuthToken } from "../../domain/entities/oauth-token.entity";
export const IAuthRepositoryPort = Symbol("IAuthRepositoryPort");
export interface IAuthRepositoryPort {
  findProviderIdByName(name: string, tx?: any): Promise<string | null>;
  findOAuthClientByClientId(
    providerId: string,
    clientId: string,
    tx?: any,
  ): Promise<OAuthClient | null>;
  findRoleIdByName(name: string, tx?: any): Promise<string | null>;
  createOAuthClient(
    oauthClient: OAuthClient,
    tx?: any,
  ): Promise<OAuthClient | null>;
  createOAuthToken(
    oauthToken: OAuthToken,
    tx?: any,
  ): Promise<OAuthToken | null>;
}
