import { SocialUserProfile } from "@/core/auth/core/domain/types/social-user-profile.interface";

export interface IAuthHandler {
  getUserInfo(user: SocialUserProfile): Promise<void>;
  validateToken(user: SocialUserProfile): Promise<void>;
  refreshToken?(code: string, redirectUri: string): Promise<void>;
  unlinkUser(user: SocialUserProfile): Promise<void>;
  logoutUser(user: SocialUserProfile): Promise<void>;
}
