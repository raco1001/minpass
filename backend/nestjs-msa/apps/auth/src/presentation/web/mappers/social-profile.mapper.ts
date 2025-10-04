import { Profile as GoogleUserProfile } from "passport-google-oauth20";
import { GithubUserProfile } from "@src/presentation/web/dto/gitubUserProfile";
import { Profile as KakaoUserProfile } from "passport-kakao";
import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";
import { OAuthProvider } from "@src/core/domain/constants/auth-providers";

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
      provider: OAuthProvider.GOOGLE as OAuthProvider,
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
      provider: OAuthProvider.GITHUB as OAuthProvider,
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
      provider: OAuthProvider.KAKAO as OAuthProvider,
      providerAccessToken: accessToken,
      providerRefreshToken: refreshToken,
    };
  }
}
