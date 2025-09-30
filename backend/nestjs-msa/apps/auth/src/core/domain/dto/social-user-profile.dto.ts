import { AuthProviderType } from "../entities/auth-provider.entity";

/**
 * @description 모든 소셜 로그인 Strategy가 반환해야 하는 표준화된 프로필 형식
 * OAuth 콜백에서만 사용됨
 */
export class SocialUserProfile {
  constructor(
    public readonly clientId: string | number,
    public readonly name: string,
    public readonly email: string | null,
    public readonly nickname: string,
    public readonly profileImage: string,
    public readonly provider: AuthProviderType,
    public readonly providerAccessToken: string,
    public readonly providerRefreshToken: string,
  ) {}
}
