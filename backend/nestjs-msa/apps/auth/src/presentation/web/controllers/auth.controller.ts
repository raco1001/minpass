import { Controller, Body, Post, Inject } from "@nestjs/common";

import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";
import { ILoginResult } from "@src/presentation/web/dtos/login-result.interface";
import { LoginServicePort } from "@src/core/ports/in/login-service.port";

@Controller()
export class AuthController {
  @Inject(LoginServicePort)
  private readonly loginService: LoginServicePort;

  @Post()
  socialLogin(@Body() profile: SocialUserProfile): Promise<ILoginResult> {
    return this.loginService.socialLogin(profile);
  }
}
