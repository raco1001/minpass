import { Injectable } from "@nestjs/common";
import { AuthServicePort } from "../core/ports/in/auth-service.port";
import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";
import { ILoginResult } from "@src/presentation/web/dtos/login-result.interface";

@Injectable()
export class AuthService implements AuthServicePort {
  async socialLogin(profile: SocialUserProfile): Promise<ILoginResult> {
    return Promise.resolve({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      expiresIn: 1000,
      isNewUser: false,
    });
  }
}
