import { AuthClientServicePort } from "@apis/core/ports/in/auth.client.service.port";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { Observable } from "rxjs";
import { auth } from "@app/contracts";

@Controller("auth")
export class AuthClientController {
  constructor(
    @Inject(AuthClientServicePort)
    private readonly authClientService: AuthClientServicePort,
  ) {}

  @Post("social-login")
  socialLogin(
    @Body() request: auth.SocialLoginRequest,
  ): Observable<auth.ILoginResult> {
    return this.authClientService.socialLogin(request);
  }
}
