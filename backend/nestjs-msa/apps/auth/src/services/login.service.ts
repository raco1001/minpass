import { Injectable } from "@nestjs/common";
import { LoginServicePort } from "@auth/core/ports/in/login-service.port";
import { SocialUserProfile } from "@auth/core/domain/dto/social-user-profile.dto";
import { ILoginResult } from "@auth/presentation/web/dtos/login-result.interface";
import { SocialLoginRequestDto } from "@auth/presentation/web/dto/socialLogin.request.dto";

@Injectable()
export class LoginService implements LoginServicePort {
  async socialLogin(dto: SocialLoginRequestDto): Promise<ILoginResult> {
    return Promise.resolve({
      userId: "userId",
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      expiresIn: 1000,
      isNewUser: false,
    });
  }
}
