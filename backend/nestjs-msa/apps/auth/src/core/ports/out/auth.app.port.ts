import { SocialUserProfile } from "@auth/core/domain/dto/social-user-profile.dto";
export abstract class AuthHandlerPort {
  abstract getUserInfo(user: SocialUserProfile): Promise<void>;
  abstract validateToken(user: SocialUserProfile): Promise<void>;
  abstract refreshToken?(code: string, redirectUri: string): Promise<void>;
  abstract unlinkUser(user: SocialUserProfile): Promise<void>;
  abstract logoutUser(user: SocialUserProfile): Promise<void>;
}
