import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile as KakaoUserProfile } from "passport-kakao";
import { SocialProfileMapper } from "@src/presentation/web/mappers/social-profile.mapper";
import { OAUTH_PROVIDER_OPTIONS } from "@src/infrastructure/auth-provider-client/provider-client-di-token";
import { ProviderOptionsMap } from "@src/infrastructure/auth-provider-client/types";
import { OAuthProvider } from "@src/core/domain/constants/auth-providers";

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, "kakao") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(OAuthProvider.KAKAO);
    if (!providerOptions) {
      throw new Error("Kakao provider options not found.");
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
      throw new Error("카카오 사용자 ID를 가져올 수 없습니다.");
    }

    return SocialProfileMapper.fromKakao(profile, accessToken, refreshToken);
  }
}
