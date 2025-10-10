import { Inject, Injectable } from "@nestjs/common";
import { AuthClientServicePort } from "@apis/core/ports/in/auth.client.service.port";
import { AuthCommandPort } from "@apis/core/ports/out/auth.command.port";
import { Observable } from "rxjs";
import { auth } from "@app/contracts";

@Injectable()
export class AuthClientService implements AuthClientServicePort {
  constructor(
    @Inject(AuthCommandPort)
    private readonly authCommand: AuthCommandPort,
  ) {}

  socialLogin(request: auth.SocialLoginRequest): Observable<auth.ILoginResult> {
    return this.authCommand.socialLogin(request);
  }
}
