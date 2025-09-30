import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";

export const IAuthHandlerPort = Symbol("IAuthHandlerPort");
export interface IAuthHandler {
  getUserInfo(user: SocialUserProfile): Promise<void>;
  validateToken(user: SocialUserProfile): Promise<void>;
  refreshToken?(code: string, redirectUri: string): Promise<void>;
  unlinkUser(user: SocialUserProfile): Promise<void>;
  logoutUser(user: SocialUserProfile): Promise<void>;
}
