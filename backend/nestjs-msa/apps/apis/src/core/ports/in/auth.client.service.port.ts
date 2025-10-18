import { auth } from "@app/contracts";
import { Observable } from "rxjs";

export abstract class AuthClientServicePort
  implements Partial<auth.AuthServiceClient>
{
  abstract socialLogin(
    request: auth.SocialLoginRequest,
  ): Observable<auth.ILoginResult>;
}
