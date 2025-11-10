import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { SocialProfileMapper } from "@apis/presentation/http/controllers/auth/mappers/social-profile.mapper";
import { GithubUserProfile } from "@apis/presentation/http/controllers/auth/dtos/gitubUserProfile";
import { ProviderOptionsMap } from "@apis/infrastructure/auth-provider/types";
import { OAUTH_PROVIDER_OPTIONS } from "@apis/infrastructure/auth-provider/auth-provider-di-token";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(AuthProvider.GITHUB);

    // Provider가 활성화되지 않았으면 기본값으로 초기화 (사용되지 않음)
    if (!providerOptions) {
      super({
        clientID: "not-configured",
        clientSecret: "not-configured",
        callbackURL: "http://localhost:3000/auth/login/github/callback",
        scope: ["user:email"],
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

  validate(
    accessToken: string,
    refreshToken: string,
    profile: GithubUserProfile,
  ) {
    if (!profile.id) {
      throw new Error("Can't get Github user id");
    }

    return SocialProfileMapper.fromGithub(profile, accessToken, refreshToken);
  }
}
