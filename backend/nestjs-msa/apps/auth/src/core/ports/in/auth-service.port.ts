import { ILoginResult } from "@src/presentation/web/dtos/login-result.interface";
import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";

export abstract class AuthServicePort {
  abstract socialLogin(profile: SocialUserProfile): Promise<ILoginResult>;
  // generate tokens
  // full logout
  // unlink provider
  // check provider scopes
  // get provider tokens
  // validate provider token
  // validate provider refresh token
  // validate provider user info

  // application
  // validate tokens
  // refresh access token
  // remove access token or remove all tokens
  // remove refresh token
}
