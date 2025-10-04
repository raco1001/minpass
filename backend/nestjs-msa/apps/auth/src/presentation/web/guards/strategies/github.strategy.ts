import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { SocialProfileMapper } from "@src/presentation/web/mappers/social-profile.mapper";
import { GithubUserProfile } from "@src/presentation/web/dto/gitubUserProfile";
import { ProviderOptionsMap } from "@src/infrastructure/auth-provider-client/types";
import { OAUTH_PROVIDER_OPTIONS } from "@src/infrastructure/auth-provider-client/provider-client-di-token";
import { OAuthProvider } from "@src/core/domain/constants/auth-providers";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(OAuthProvider.GITHUB);
    if (!providerOptions) {
      throw new Error("Github provider options not found.");
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
      throw new Error("카카오 사용자 ID를 가져올 수 없습니다.");
    }

    return SocialProfileMapper.fromGithub(profile, accessToken, refreshToken);
  }
}
