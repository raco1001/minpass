import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { SocialProfileMapper } from "@apis/presentation/http/controllers/mappers/social-profile.mapper";
import { ProviderOptionsMap } from "@apis/infrastructure/auth-provider/types";
import { OAUTH_PROVIDER_OPTIONS } from "@apis/infrastructure/auth-provider/auth-provider-di-token";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(AuthProvider.GOOGLE);

    // Provider가 활성화되지 않았으면 기본값으로 초기화 (사용되지 않음)
    if (!providerOptions) {
      super({
        clientID: "not-configured",
        clientSecret: "not-configured",
        callbackURL: "http://localhost:3000/auth/login/google/callback",
        scope: ["email", "profile"],
      });
      return;
    }

    super({
      clientID: providerOptions.clientId,
      clientSecret: providerOptions.clientSecret,
      callbackURL: providerOptions.callbackUrl,
      scope: providerOptions.scope,
    });
  }

  validate(accessToken: string, refreshToken: string, profile: GoogleProfile) {
    if (!profile.id) {
      throw new Error("Can't get Google user id");
    }

    return SocialProfileMapper.fromGoogle(profile, accessToken, refreshToken);
  }
}
