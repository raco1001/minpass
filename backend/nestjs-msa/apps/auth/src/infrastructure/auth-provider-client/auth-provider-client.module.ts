import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "../../core/domain/constants/auth-providers";
import { BaseProviderOptions, ProviderOptionsMap } from "./types";
import { OAUTH_PROVIDER_OPTIONS } from "./auth-provider-client-di-token";
import { GoogleStrategy } from "@apis/presentation/http/controllers/guards/strategies/google.strategy";
import { GithubStrategy } from "@apis/presentation/http/controllers/guards/strategies/github.strategy";
import { KakaoStrategy } from "@apis/presentation/http/controllers/guards/strategies/kakao.strategy";
import { DynamicAuthGuard } from "@apis/presentation/http/controllers/guards/dynamic-auth.guard";

function buildCallbackUrl(base: string, path: string) {
  return new URL(path, base).toString();
}

function assembleProviderOptions(env: any): ProviderOptionsMap {
  const providers = new Map<AuthProvider, BaseProviderOptions>();

  const enabled: string[] = env.ENABLED_PROVIDERS.split(",") ?? [];
  const enabledSet = new Set(enabled.map((v) => v.toLowerCase()));

  if (enabledSet.has(AuthProvider.GOOGLE)) {
    const missing: string[] = [];
    if (!env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
    if (!env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[google] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath = env.GOOGLE_CALLBACK_PATH ?? "/auth/google/callback";
    providers.set(AuthProvider.GOOGLE, {
      provider: AuthProvider.GOOGLE,
      clientId: String(env.GOOGLE_CLIENT_ID),
      clientSecret: String(env.GOOGLE_CLIENT_SECRET),
      callbackUrl: buildCallbackUrl(
        String(env.REDIRECT_BASE_URL),
        callbackPath,
      ),
      scope: ["email", "profile"],
    });
  }

  if (enabledSet.has(AuthProvider.GITHUB)) {
    const missing: string[] = [];
    if (!env.GITHUB_CLIENT_ID) missing.push("GITHUB_CLIENT_ID");
    if (!env.GITHUB_CLIENT_SECRET) missing.push("GITHUB_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[github] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath = env.GITHUB_CALLBACK_PATH ?? "/auth/github/callback";
    providers.set(AuthProvider.GITHUB, {
      provider: AuthProvider.GITHUB,
      clientId: String(env.GITHUB_CLIENT_ID),
      clientSecret: String(env.GITHUB_CLIENT_SECRET),
      callbackUrl: buildCallbackUrl(
        String(env.REDIRECT_BASE_URL),
        callbackPath,
      ),
      scope: ["public_profile"],
    });
  }

  if (enabledSet.has(AuthProvider.KAKAO)) {
    const missing: string[] = [];
    if (!env.KAKAO_CLIENT_ID) missing.push("KAKAO_CLIENT_ID");
    if (!env.KAKAO_CLIENT_SECRET) missing.push("KAKAO_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[kakao] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath = env.KAKAO_CALLBACK_PATH ?? "/auth/kakao/callback";
    providers.set(AuthProvider.KAKAO, {
      provider: AuthProvider.KAKAO,
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
    if (enabledProviders.includes(AuthProvider.GOOGLE)) {
      strategies.push(GoogleStrategy);
    }
    if (enabledProviders.includes(AuthProvider.GITHUB)) {
      strategies.push(GithubStrategy);
    }
    if (enabledProviders.includes(AuthProvider.KAKAO)) {
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
