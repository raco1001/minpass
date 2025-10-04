import { Injectable } from "@nestjs/common";
import { LoginServicePort } from "../core/ports/in/login-service.port";
import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";
import { ILoginResult } from "@src/presentation/web/dtos/login-result.interface";

@Injectable()
export class LoginService implements LoginServicePort {
  async socialLogin(profile: SocialUserProfile): Promise<ILoginResult> {
    return Promise.resolve({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      expiresIn: 1000,
      isNewUser: false,
    });
  }
}
