import { AuthClientEntity } from "./auth-client.entity";
import { SocialUserProfile } from "../dto/social-user-profile.dto";

export class AuthTokenEntity {
  constructor(
    public readonly id: string,
    public readonly authClientId: AuthClientEntity["id"],
    public readonly providerAccessToken: SocialUserProfile["providerAccessToken"],
    public readonly providerRefreshToken: SocialUserProfile["providerRefreshToken"],
    public readonly refreshToken: string,
    public readonly revoked: boolean,
    public readonly expiresAt: Date = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}

export class TokensEntity {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
