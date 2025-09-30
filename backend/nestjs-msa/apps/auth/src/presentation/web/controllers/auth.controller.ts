import { Controller, Body, Post, Inject } from "@nestjs/common";

import { SocialUserProfile } from "@src/core/domain/dto/social-user-profile.dto";
import { ILoginResult } from "@src/presentation/web/dtos/login-result.interface";
import { IAuthServicePort } from "@src/core/ports/in/auth-service.port";

@Controller()
export class AuthController {
  @Inject(IAuthServicePort)
  private readonly authService: IAuthServicePort;

  @Post()
  socialLogin(@Body() profile: SocialUserProfile): Promise<ILoginResult> {
    return this.authService.socialLogin(profile);
  }
}
