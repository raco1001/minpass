import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile as KakaoUserProfile } from "passport-kakao";
import { SocialProfileMapper } from "@apis/presentation/http/controllers/mappers/social-profile.mapper";
import { OAUTH_PROVIDER_OPTIONS } from "@apis/infrastructure/auth-provider/auth-provider-di-token";
import { ProviderOptionsMap } from "@apis/infrastructure/auth-provider/types";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(AuthProvider.KAKAO);

    // Provider가 활성화되지 않았으면 기본값으로 초기화 (사용되지 않음)
    if (!providerOptions) {
      super({
        clientID: "not-configured",
        clientSecret: "not-configured",
        callbackURL: "http://localhost:3000/auth/login/kakao/callback",
        scope: ["account_email", "profile_nickname"],
      });
      return;
    }

    super({
      clientID: providerOptions.clientId,
      clientSecret: providerOptions.clientSecret,
      callbackURL: providerOptions.callbackUrl,
      scope: providerOptions.scope,
      authorizationParams: {
        prompt: "login",
      },
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: KakaoUserProfile,
  ) {
    if (!profile.id) {
      throw new Error("Can't get Kakao user id");
    }

    return SocialProfileMapper.fromKakao(profile, accessToken, refreshToken);
  }
}
