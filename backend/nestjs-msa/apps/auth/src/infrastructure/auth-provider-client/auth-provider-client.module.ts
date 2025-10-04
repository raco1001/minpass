import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { validateEnv } from "./env.schema";
import { OAuthProvider } from "../../core/domain/constants/auth-providers";
import { BaseProviderOptions, ProviderOptionsMap } from "./types";
import { OAUTH_PROVIDER_OPTIONS } from "./provider-client-di-token";
import { GoogleStrategy } from "@src/presentation/web/guards/strategies/google.strategy";
import { GithubStrategy } from "@src/presentation/web/guards/strategies/github.strategy";
import { KakaoStrategy } from "@src/presentation/web/guards/strategies/kakao.strategy";
import { DynamicAuthGuard } from "@src/presentation/web/guards/dynamic-auth.guard";

function buildCallbackUrl(base: string, path: string) {
  return new URL(path, base).toString();
}

function assembleProviderOptions(env: any): ProviderOptionsMap {
  const providers = new Map<OAuthProvider, BaseProviderOptions>();

  const enabled: string[] = env.ENABLED_PROVIDERS.split(",") ?? [];
  const enabledSet = new Set(enabled.map((v) => v.toLowerCase()));

  if (enabledSet.has(OAuthProvider.GOOGLE)) {
    const missing: string[] = [];
    if (!env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
    if (!env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[google] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath = env.GOOGLE_CALLBACK_PATH ?? "/auth/google/callback";
    providers.set(OAuthProvider.GOOGLE, {
      provider: OAuthProvider.GOOGLE,
      clientId: String(env.GOOGLE_CLIENT_ID),
      clientSecret: String(env.GOOGLE_CLIENT_SECRET),
      callbackUrl: buildCallbackUrl(
        String(env.REDIRECT_BASE_URL),
        callbackPath,
      ),
      scope: ["email", "profile"],
    });
  }

  if (enabledSet.has(OAuthProvider.GITHUB)) {
    const missing: string[] = [];
    if (!env.GITHUB_CLIENT_ID) missing.push("GITHUB_CLIENT_ID");
    if (!env.GITHUB_CLIENT_SECRET) missing.push("GITHUB_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[github] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath = env.GITHUB_CALLBACK_PATH ?? "/auth/github/callback";
    providers.set(OAuthProvider.GITHUB, {
      provider: OAuthProvider.GITHUB,
      clientId: String(env.GITHUB_CLIENT_ID),
      clientSecret: String(env.GITHUB_CLIENT_SECRET),
      callbackUrl: buildCallbackUrl(
        String(env.REDIRECT_BASE_URL),
        callbackPath,
      ),
      scope: ["public_profile"],
    });
  }

  if (enabledSet.has(OAuthProvider.KAKAO)) {
    const missing: string[] = [];
    if (!env.KAKAO_CLIENT_ID) missing.push("KAKAO_CLIENT_ID");
    if (!env.KAKAO_CLIENT_SECRET) missing.push("KAKAO_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[kakao] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath = env.KAKAO_CALLBACK_PATH ?? "/auth/kakao/callback";
    providers.set(OAuthProvider.KAKAO, {
      provider: OAuthProvider.KAKAO,
      clientId: String(env.KAKAO_CLIENT_ID),
      clientSecret: String(env.KAKAO_CLIENT_SECRET),
      callbackUrl: buildCallbackUrl(
        String(env.REDIRECT_BASE_URL),
        callbackPath,
      ),
      scope: ["account_email", "profile_nickname"],
    });
  }

  return providers;
}

@Module({})
export class AuthProviderClientModule {
  static register(): DynamicModule {
    const strategies: any[] = [];
    const enabledProviders = (process.env.ENABLED_PROVIDERS || "").split(",");
    if (enabledProviders.includes(OAuthProvider.GOOGLE)) {
      strategies.push(GoogleStrategy);
    }
    if (enabledProviders.includes(OAuthProvider.GITHUB)) {
      strategies.push(GithubStrategy);
    }
    if (enabledProviders.includes(OAuthProvider.KAKAO)) {
      strategies.push(KakaoStrategy);
    }

    return {
      module: AuthProviderClientModule,
      providers: [
        DynamicAuthGuard,
        {
          provide: OAUTH_PROVIDER_OPTIONS,
          inject: [ConfigService],
          useFactory: (cfg: ConfigService) => {
            const env =
              cfg.get<Record<string, any>>("", { infer: true }) || process.env;
            return assembleProviderOptions(env);
          },
        },
        ...strategies,
      ],
      exports: [OAUTH_PROVIDER_OPTIONS, DynamicAuthGuard, ...strategies],
    };
  }
}
