import { Controller, Inject } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { LoginServicePort } from "@auth/core/ports/in/login-service.port";

import { auth } from "@app/contracts";

@auth.AuthServiceControllerMethods()
@Controller()
export class AuthController implements auth.AuthServiceController {
  constructor(
    @Inject(LoginServicePort)
    private readonly loginService: LoginServicePort,
  ) {}

  @GrpcMethod("AuthService", "SocialLogin")
  socialLogin(data: auth.SocialLoginRequest): Promise<auth.ILoginResult> {
    return this.loginService.socialLogin(data);
  }
}
