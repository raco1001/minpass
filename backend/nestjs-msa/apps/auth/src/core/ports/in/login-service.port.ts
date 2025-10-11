import { auth } from "@app/contracts";

export abstract class LoginServicePort {
  abstract socialLogin(
    profile: auth.SocialLoginRequest,
  ): Promise<auth.ILoginResult>;
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
