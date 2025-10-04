import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { SocialProfileMapper } from "@src/presentation/web/mappers/social-profile.mapper";
import { ProviderOptionsMap } from "@src/infrastructure/auth-provider-client/types";
import { OAUTH_PROVIDER_OPTIONS } from "@src/infrastructure/auth-provider-client/provider-client-di-token";
import { OAuthProvider } from "@src/core/domain/constants/auth-providers";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(OAuthProvider.GOOGLE);
    if (!providerOptions) {
      throw new Error("Google provider options not found.");
    }

    super({
      clientID: providerOptions.clientId,
      clientSecret: providerOptions.clientSecret,
      callbackURL: providerOptions.callbackUrl,
      scope: providerOptions.scope,
    });
  }

  validate(accessToken: string, refreshToken: string, profile: GoogleProfile) {
    return SocialProfileMapper.fromGoogle(profile, accessToken, refreshToken);
  }
}
