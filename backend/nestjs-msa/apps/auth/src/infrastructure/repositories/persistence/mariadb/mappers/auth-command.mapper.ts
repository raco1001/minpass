import {
  CreateAuthClientPersistenceRequestDto,
  CreateAuthClientPersistenceResponseDto,
  CreateAuthTokensInfoPersistenceRequestDto,
  CreateAuthTokensInfoPersistenceResponseDto,
  UpdateAuthClientPersistenceResponseDto,
  UpdateAuthTokensInfoPersistenceRequestDto,
  UpdateAuthTokensInfoPersistenceResponseDto,
} from "../dtos/auth-repository-command.dto";
import {
  CreateAuthClientDomainRequestDto,
  CreateAuthClientDomainResponseDto,
  CreateAuthTokenDomainRequestDto,
  CreateAuthTokenDomainResponseDto,
  UpdateAuthClientDomainResponseDto,
  UpdateAuthTokensInfoDomainRequestDto,
  UpdateAuthTokensInfoDomainResponseDto,
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
    authTokensInfo: UpdateAuthTokensInfoDomainRequestDto,
  ): UpdateAuthTokensInfoPersistenceRequestDto {
    return new UpdateAuthTokensInfoPersistenceRequestDto(
      authTokensInfo.authClientId,
      authTokensInfo.providerAccessToken,
      authTokensInfo.providerRefreshToken,
      authTokensInfo.refreshToken,
      authTokensInfo.revoked,
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

  static toDomainUpdateAuthTokensInfo(
    row: UpdateAuthTokensInfoPersistenceResponseDto,
  ): UpdateAuthTokensInfoDomainResponseDto {
    return new UpdateAuthTokensInfoDomainResponseDto(
      row.id,
      row.authClientId,
      row.revoked,
      row.expiresAt,
      row.updatedAt,
    );
  }
}
