import {
  ILoginResult,
  SocialLoginRequest,
} from "@app/contracts/generated/auth/v1/auth";
import { Observable } from "rxjs";

export abstract class AuthClientServicePort {
  abstract socialLogin(request: SocialLoginRequest): Observable<ILoginResult>;
}
