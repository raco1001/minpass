import { Profile as GoogleUserProfile } from "passport-google-oauth20";
import { GithubUserProfile } from "@auth/presentation/web/dto/gitubUserProfile";
import { Profile as KakaoUserProfile } from "passport-kakao";
import { SocialUserProfile } from "@auth/core/domain/dto/social-user-profile.dto";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

export class SocialProfileMapper {
  static fromGoogle(
    profile: GoogleUserProfile,
    accessToken: string,
    refreshToken: string,
  ): SocialUserProfile {
    return {
      clientId: profile.id,
      email: profile.emails?.[0]?.value || null,
      name: profile.name?.givenName + " " + profile.name?.familyName || "",
      nickname: profile.name?.givenName + " " + profile.name?.familyName || "",
      profileImage: profile.photos?.[0]?.value,
      provider: AuthProvider.GOOGLE as AuthProvider,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken,
    };
  }

  static fromGithub(
    profile: GithubUserProfile,
    accessToken: string,
    refreshToken: string,
  ): SocialUserProfile {
    return {
      clientId: profile.id,
      email: profile.email || null,
      name: profile.username || "",
      nickname: profile.username || "",
      profileImage: profile.photos?.[0]?.value,
      provider: AuthProvider.GITHUB as AuthProvider,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken,
    };
  }

  static fromKakao(
    profile: KakaoUserProfile,
    accessToken: string,
    refreshToken: string,
  ): SocialUserProfile {
    return {
      clientId: profile.id,
      email: profile.emails?.[0]?.value || null,
      name: profile.displayName || "",
      nickname: profile.displayName || "",
      profileImage: profile.photos?.[0]?.value,
      provider: AuthProvider.KAKAO as AuthProvider,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken,
    };
  }
}
