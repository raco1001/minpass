import { ILoginResult } from "@auth/presentation/web/dtos/login-result.interface";
import { SocialLoginRequestDto } from "@auth/presentation/web/dto/socialLogin.request.dto";

export abstract class LoginServicePort {
  abstract socialLogin(profile: SocialLoginRequestDto): Promise<ILoginResult>;
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
