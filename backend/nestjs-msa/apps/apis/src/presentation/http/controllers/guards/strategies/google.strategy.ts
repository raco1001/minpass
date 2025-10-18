import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { SocialProfileMapper } from "@apis/presentation/http/controllers/mappers/social-profile.mapper";
import { ProviderOptionsMap } from "@auth/infrastructure/auth-provider-client/types";
import { OAUTH_PROVIDER_OPTIONS } from "@auth/infrastructure/auth-provider-client/auth-provider-client-di-token";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    providerOptionsMap: ProviderOptionsMap,
  ) {
    const providerOptions = providerOptionsMap.get(AuthProvider.GOOGLE);
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
    if (!profile.id) {
      throw new Error("Can't get Google user id");
    }

    return SocialProfileMapper.fromGoogle(profile, accessToken, refreshToken);
  }
}
