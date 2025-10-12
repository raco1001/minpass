import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";

import {
  FindProviderByProviderDomainRequestDto,
  FindAuthTokenDomainRequestDto,
  FindAuthClientByClientIdAndProviderIdDomainRequestDto,
  FindAuthClientByClientIdAndProviderIdDomainResponseDto,
  FindProviderByProviderDomainResponseDto,
  FindAuthTokenDomainResponseDto,
} from "@auth/core/domain/dtos/auth-query.dto";
import {
  CreateAuthTokenDomainRequestDto,
  UpdateAuthTokensInfoDomainRequestDto,
  CreateAuthClientDomainRequestDto,
  CreateAuthClientDomainResponseDto,
  CreateAuthTokenDomainResponseDto,
  UpdateAuthClientDomainResponseDto,
  UpdateAuthTokensInfoDomainResponseDto,
} from "@auth/core/domain/dtos/auth-command.dtos";

export abstract class AuthRepositoryPort {
  abstract findProviderByProvider(
    provider: FindProviderByProviderDomainRequestDto,
  ): Promise<FindProviderByProviderDomainResponseDto | null>;

  abstract findAuthClientByClientIdAndProviderId(
    authClient: FindAuthClientByClientIdAndProviderIdDomainRequestDto,
  ): Promise<FindAuthClientByClientIdAndProviderIdDomainResponseDto | null>;

  abstract findAuthTokenInfoByClientId(
    request: FindAuthTokenDomainRequestDto,
  ): Promise<FindAuthTokenDomainResponseDto | null>;

  abstract createAuthClient(
    authClient: CreateAuthClientDomainRequestDto,
  ): Promise<CreateAuthClientDomainResponseDto | null>;

  abstract createAuthToken(
    authToken: CreateAuthTokenDomainRequestDto,
  ): Promise<CreateAuthTokenDomainResponseDto | null>;

  abstract updateAuthClientTimestamp(
    authClient: UpdateAuthClientDomainResponseDto,
  ): Promise<UpdateAuthClientDomainResponseDto | null>;

  abstract updateAuthTokens(
    authTokenInfo: UpdateAuthTokensInfoDomainRequestDto,
  ): Promise<UpdateAuthTokensInfoDomainResponseDto | null>;
}
