import { Inject, Injectable } from "@nestjs/common";

import { auth } from "@app/contracts";

import { AUTH_SERVICE_CLIENT } from "./auth.grpc.client.constants";
import { AuthCommandPort } from "@apis/core/ports/out/auth.command.port";

import { Observable } from "rxjs";

@Injectable()
export class AuthGrpcClientAdapter implements AuthCommandPort {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT)
    private readonly client: auth.AuthServiceClient,
  ) {}

  socialLogin(request: auth.SocialLoginRequest): Observable<auth.ILoginResult> {
    return this.client.socialLogin(request);
  }
}
