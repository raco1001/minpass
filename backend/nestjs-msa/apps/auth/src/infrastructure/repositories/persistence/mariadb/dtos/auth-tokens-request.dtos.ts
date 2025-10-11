import { AuthTokenEntity } from "@auth/core/domain/entities/token.entity";
import { auth } from "@app/contracts";
import { AuthClientEntity } from "@auth/core/domain/entities/auth-client.entity";
import { AuthProviderEntity } from "@auth/core/domain/entities/auth-provider.entity";
import { User } from "@app/contracts/generated/users/v1/users";

export class CreateAuthTokenDto {
  authClientId: AuthClientEntity["id"];
  providerAccessToken: AuthTokenEntity["providerAccessToken"];
  providerRefreshToken: AuthTokenEntity["providerRefreshToken"];
  refreshToken: AuthTokenEntity["refreshToken"];
}

export class UpdateAuthTokenDto {
  authClientId: AuthClientEntity["id"];
  providerAccessToken: AuthTokenEntity["providerAccessToken"];
  providerRefreshToken: AuthTokenEntity["providerRefreshToken"];
  refreshToken: AuthTokenEntity["refreshToken"];
  revoked: AuthTokenEntity["revoked"];
  expiresAt: AuthTokenEntity["expiresAt"];
  updatedAt: AuthTokenEntity["updatedAt"];
}

export class FindAuthTokenDto {
  authClientId: AuthClientEntity["id"];
}

export class CreateAuthClientDto {
  userId: User["id"];
  providerId: AuthProviderEntity["id"];
  clientId: AuthClientEntity["clientId"];
}

export class UpdateAuthClientDto {
  id: AuthClientEntity["id"];
}
