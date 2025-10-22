import {
  CreateAuthClientPersistenceRequestDto,
  CreateAuthClientPersistenceResponseDto,
  CreateAuthTokensInfoPersistenceRequestDto,
  CreateAuthTokensInfoPersistenceResponseDto,
  UpdateAuthClientPersistenceResponseDto,
  UpdateAuthTokensInfoPersistenceResponseDto,
  UpsertAuthTokensInfoPersistenceRequestDto,
} from "../dtos/auth-repository-command.dto";
import {
  CreateAuthClientDomainRequestDto,
  CreateAuthClientDomainResponseDto,
  CreateAuthTokenDomainRequestDto,
  CreateAuthTokenDomainResponseDto,
  UpdateAuthClientDomainResponseDto,
  UpsertAuthTokensInfoDomainRequestDto,
  UpsertAuthTokensInfoDomainResponseDto,
} from "@auth/core/domain/dtos/auth-command.dtos";

export class AuthCommandMapper {
  static toRowCreateAuthTokensInfo(
    authTokensInfo: CreateAuthTokenDomainRequestDto,
  ): CreateAuthTokensInfoPersistenceRequestDto {
    return new CreateAuthTokensInfoPersistenceRequestDto(
      authTokensInfo.authClientId,
      authTokensInfo.providerAccessToken,
      authTokensInfo.providerRefreshToken,
      authTokensInfo.refreshToken,
    );
  }

  static toRowUpdateAuthTokensInfo(
    authTokensInfo: UpsertAuthTokensInfoDomainRequestDto,
  ): UpsertAuthTokensInfoPersistenceRequestDto {
    return new UpsertAuthTokensInfoPersistenceRequestDto(
      authTokensInfo.authClientId,
      authTokensInfo.providerAccessToken,
      authTokensInfo.providerRefreshToken,
      authTokensInfo.refreshToken,
      authTokensInfo.revoked ?? false,
      authTokensInfo.expiresAt,
      authTokensInfo.updatedAt,
    );
  }

  static toRowCreateAuthClient(
    authClient: CreateAuthClientDomainRequestDto,
  ): CreateAuthClientPersistenceRequestDto {
    return new CreateAuthClientPersistenceRequestDto(
      authClient.userId,
      authClient.providerId,
      authClient.clientId,
      authClient.salt ?? null,
    );
  }

  static toDomainCreateAuthTokensInfo(
    row: CreateAuthTokensInfoPersistenceResponseDto,
  ): CreateAuthTokenDomainResponseDto {
    return new CreateAuthTokenDomainResponseDto(
      row.id,
      row.authClientId,
      row.revoked,
      row.expiresAt,
      row.createdAt,
    );
  }

  static toDomainCreateAuthClient(
    row: CreateAuthClientPersistenceResponseDto,
  ): CreateAuthClientDomainResponseDto {
    return new CreateAuthClientDomainResponseDto(
      row.userId,
      row.providerId,
      row.clientId,
    );
  }

  static toDomainUpdateAuthClient(
    row: UpdateAuthClientPersistenceResponseDto,
  ): UpdateAuthClientDomainResponseDto {
    return new UpdateAuthClientDomainResponseDto(
      row.userId,
      row.providerId,
      row.clientId,
      row.updatedAt,
    );
  }

  static toDomainUpsertAuthTokensInfo(
    row: UpdateAuthTokensInfoPersistenceResponseDto,
  ): UpsertAuthTokensInfoDomainResponseDto {
    return new UpsertAuthTokensInfoDomainResponseDto(
      row.id,
      row.authClientId,
      row.revoked ?? false,
      row.expiresAt ?? new Date(),
      row.updatedAt ?? new Date(),
    );
  }
}
