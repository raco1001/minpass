import { ILoginResult } from "@src/presentation/grpc/dtos/login-result.interface";
import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";

export const IAuthServicePort = Symbol("IAuthServicePort");
export interface IAuthServicePort {
  socialLogin(profile: SocialUserProfile): Promise<ILoginResult>;
  oauthCallback(code: string, redirectUri: string): Promise<ILoginResult>;
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
