import {
  FindAuthClientByClientIdAndProviderIdDomainRequestDto,
  FindAuthTokenDomainRequestDto,
  FindProviderByProviderDomainRequestDto,
  FindAuthClientByClientIdAndProviderIdDomainResponseDto,
} from "../../../../../core/domain/dtos/auth-query.dto";
import {
  FindAuthClientByClientIdAndProviderIdPersistenceRequestDto,
  FindAuthTokenDomainResponseDto,
  FindAuthTokenInfoPersistenceRequestDto,
  FindProviderByProviderDomainResponseDto,
  FindProviderByProviderPersistenceRequestDto,
} from "../dtos/auth-repository-query.dto";

export class AuthQueryMapper {
  static toRowFindProviderByProvider(
    authProvider: FindProviderByProviderDomainRequestDto,
  ): FindProviderByProviderPersistenceRequestDto {
    return new FindProviderByProviderPersistenceRequestDto(
      authProvider.provider,
    );
  }

  static toRowFindAuthTokenInfo(
    authToken: FindAuthTokenDomainRequestDto,
  ): FindAuthTokenInfoPersistenceRequestDto {
    return new FindAuthTokenInfoPersistenceRequestDto(authToken.authClientId);
  }

  static toRowFindAuthClientByClientIdAndProviderId(
    authClient: FindAuthClientByClientIdAndProviderIdDomainRequestDto,
  ): FindAuthClientByClientIdAndProviderIdPersistenceRequestDto {
    return new FindAuthClientByClientIdAndProviderIdPersistenceRequestDto(
      authClient.providerId,
      authClient.clientId,
    );
  }

  static toDomainFindProviderByProvider(
    row: FindProviderByProviderDomainResponseDto,
  ): FindProviderByProviderDomainResponseDto {
    return new FindProviderByProviderDomainResponseDto(row.id, row.provider);
  }

  static toDomainFindAuthTokenInfo(
    row: FindAuthTokenDomainResponseDto,
  ): FindAuthTokenDomainResponseDto {
    return new FindAuthTokenDomainResponseDto(
      row.id,
      row.authClientId,
      row.revoked,
      row.expiresAt,
      row.createdAt,
    );
  }

  static toDomainFindAuthClientByClientIdAndProviderId(
    row: FindAuthClientByClientIdAndProviderIdDomainResponseDto,
  ): FindAuthClientByClientIdAndProviderIdDomainResponseDto {
    return new FindAuthClientByClientIdAndProviderIdDomainResponseDto(
      row.id,
      row.userId,
    );
  }
}
