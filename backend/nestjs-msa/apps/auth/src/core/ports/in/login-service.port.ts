import { auth } from "@app/contracts";

export abstract class LoginServicePort {
  abstract socialLogin(
    profile: auth.SocialLoginRequest,
  ): Promise<auth.LoginResult>;
}
