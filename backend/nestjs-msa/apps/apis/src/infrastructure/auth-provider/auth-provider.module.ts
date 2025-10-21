import { DynamicModule, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { BaseProviderOptions, ProviderOptionsMap } from "./types";
import { OAUTH_PROVIDER_OPTIONS } from "./auth-provider-di-token";
import { GoogleStrategy } from "./strategies/google.strategy";
import { GithubStrategy } from "./strategies/github.strategy";
import { KakaoStrategy } from "./strategies/kakao.strategy";
import { DynamicAuthGuard } from "./guards/dynamic-auth.guard";

/**
 * Helper function to build OAuth callback URL
 */
function buildCallbackUrl(base: string, path: string): string {
  return new URL(path, base).toString();
}

/**
 * Assembles provider options from environment variables
 */
function assembleProviderOptions(env: any): ProviderOptionsMap {
  const providers = new Map<AuthProvider, BaseProviderOptions>();

  const enabled: string[] = env.ENABLED_PROVIDERS?.split(",") ?? [];
  const enabledSet = new Set(enabled.map((v) => v.toLowerCase()));

  // Google OAuth Configuration
  if (enabledSet.has(AuthProvider.GOOGLE)) {
    const missing: string[] = [];
    if (!env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
    if (!env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[Google OAuth] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath =
      env.GOOGLE_CALLBACK_PATH ?? "/auth/login/google/callback";
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

  // GitHub OAuth Configuration
  if (enabledSet.has(AuthProvider.GITHUB)) {
    const missing: string[] = [];
    if (!env.GITHUB_CLIENT_ID) missing.push("GITHUB_CLIENT_ID");
    if (!env.GITHUB_CLIENT_SECRET) missing.push("GITHUB_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[GitHub OAuth] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath =
      env.GITHUB_CALLBACK_PATH ?? "/auth/login/github/callback";
    providers.set(AuthProvider.GITHUB, {
      provider: AuthProvider.GITHUB,
      clientId: String(env.GITHUB_CLIENT_ID),
      clientSecret: String(env.GITHUB_CLIENT_SECRET),
      callbackUrl: buildCallbackUrl(
        String(env.REDIRECT_BASE_URL),
        callbackPath,
      ),
      scope: ["user:email"],
    });
  }

  // Kakao OAuth Configuration
  if (enabledSet.has(AuthProvider.KAKAO)) {
    const missing: string[] = [];
    if (!env.KAKAO_CLIENT_ID) missing.push("KAKAO_CLIENT_ID");
    if (!env.KAKAO_CLIENT_SECRET) missing.push("KAKAO_CLIENT_SECRET");
    if (missing.length) {
      throw new Error(`[Kakao OAuth] Missing env: ${missing.join(", ")}`);
    }
    const callbackPath =
      env.KAKAO_CALLBACK_PATH ?? "/auth/login/kakao/callback";
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

/**
 * AuthProviderModule
 *
 * Manages OAuth authentication providers for the API Gateway.
 * This module:
 * - Configures Passport.js with OAuth strategies
 * - Registers provider-specific strategies (Google, GitHub, Kakao)
 * - Provides dynamic authentication guard for multi-provider support
 *
 * Usage: Import this module in your HTTP module to enable OAuth authentication
 */
@Module({})
export class AuthProviderModule {
  static register(): DynamicModule {
    const strategies: any[] = [];
    const enabledProviders = (process.env.ENABLED_PROVIDERS || "").split(",");

    // Dynamically register strategies based on enabled providers
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
      module: AuthProviderModule,
      imports: [
        // Register PassportModule with session disabled (for JWT-based auth)
        PassportModule.register({ session: false }),
      ],
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
      exports: [OAUTH_PROVIDER_OPTIONS, DynamicAuthGuard, PassportModule],
    };
  }
}
