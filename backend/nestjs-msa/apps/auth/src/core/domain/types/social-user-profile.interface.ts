/**
 * @description 모든 소셜 로그인 Strategy가 반환해야 하는 표준화된 프로필 형식
 * OAuth 콜백에서만 사용됨
 */
export interface SocialUserProfile {
  clientId: string | number;
  name?: string;
  email?: string | null;
  nickname?: string;
  profileImage?: string;
  provider: "google" | "github" | "kakao";
  providerAccessToken: string;
  providerRefreshToken: string;
}
