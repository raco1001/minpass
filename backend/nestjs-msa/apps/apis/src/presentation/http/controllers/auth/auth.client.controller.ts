import { AuthClientServicePort } from "@apis/core/ports/in/auth.client.service.port";
import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { auth } from "@app/contracts";
import { DynamicAuthGuard } from "../guards/dynamic-auth.guard";

@Controller("auth")
export class AuthClientController {
  constructor(
    @Inject(AuthClientServicePort)
    private readonly authClientService: AuthClientServicePort,
  ) {}

  @Post("login/:provider")
  @UseGuards(DynamicAuthGuard)
  redirectToProvider(@Param("provider") provider: string): Observable<null> {
    return of(null);
  }

  @Post("login/:provider/callback")
  @UseGuards(DynamicAuthGuard)
  socialLogin(
    @Body() request: auth.SocialLoginRequest,
  ): Observable<auth.ILoginResult> {
    return this.authClientService.socialLogin(request);
  }
}
