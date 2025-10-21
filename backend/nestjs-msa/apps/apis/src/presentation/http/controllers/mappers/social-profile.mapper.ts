import { Profile as GoogleUserProfile } from "passport-google-oauth20";
import { GithubUserProfile } from "@apis/presentation/http/controllers/auth/dtos/gitubUserProfile";
import { Profile as KakaoUserProfile } from "passport-kakao";
import { auth } from "@app/contracts";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

/**
 * SocialProfileMapper
 *
 * Maps OAuth provider-specific user profiles to standardized SocialUserProfile format.
 * This ensures consistent data structure across different OAuth providers.
 */
export class SocialProfileMapper {
  /**
   * Maps Google OAuth profile to standardized format
   */
  static fromGoogle(
    profile: GoogleUserProfile,
    accessToken: string,
    refreshToken: string,
  ): auth.SocialUserProfile {
    return {
      clientId: profile.id,
      email: profile.emails?.[0]?.value || "",
      name: profile.name?.givenName + " " + profile.name?.familyName || "",
      nickname: profile.name?.givenName + " " + profile.name?.familyName || "",
      profileImage: profile.photos?.[0]?.value || "",
      provider: AuthProvider.GOOGLE,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken || "",
    };
  }

  /**
   * Maps GitHub OAuth profile to standardized format
   */
  static fromGithub(
    profile: GithubUserProfile,
    accessToken: string,
    refreshToken: string,
  ): auth.SocialUserProfile {
    return {
      clientId: profile.id,
      email: profile.email || "",
      name: profile.username || "",
      nickname: profile.username || "",
      profileImage: profile.photos?.[0]?.value || "",
      provider: AuthProvider.GITHUB,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken || "",
    };
  }

  /**
   * Maps Kakao OAuth profile to standardized format
   */
  static fromKakao(
    profile: KakaoUserProfile,
    accessToken: string,
    refreshToken: string,
  ): auth.SocialUserProfile {
    return {
      clientId: profile.id,
      email: profile.emails?.[0]?.value || "",
      name: profile.displayName || "",
      nickname: profile.displayName || "",
      profileImage: profile.photos?.[0]?.value || "",
      provider: AuthProvider.KAKAO,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken || "",
    };
  }
}
