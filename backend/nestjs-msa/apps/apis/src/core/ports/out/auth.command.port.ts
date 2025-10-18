import { auth } from "@app/contracts";
import { Observable } from "rxjs";

export abstract class AuthCommandPort {
  abstract socialLogin(
    request: auth.SocialLoginRequest,
  ): Observable<auth.ILoginResult>;
}
