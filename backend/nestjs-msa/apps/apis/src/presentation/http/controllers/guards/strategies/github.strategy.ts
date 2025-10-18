import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";
import { SocialProfileMapper } from "@apis/presentation/http/controllers/mappers/social-profile.mapper";
import { GithubUserProfile } from "@apis/presentation/http/controllers/auth/dtos/gitubUserProfile";
import { ProviderOptionsMap } from "@auth/infrastructure/auth-provider-client/types";
import { OAUTH_PROVIDER_OPTIONS } from "@auth/infrastructure/auth-provider-client/auth-provider-client-di-token";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(AuthProvider.GITHUB);
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
      throw new Error("Can't get Github user id");
    }

    return SocialProfileMapper.fromGithub(profile, accessToken, refreshToken);
  }
}
