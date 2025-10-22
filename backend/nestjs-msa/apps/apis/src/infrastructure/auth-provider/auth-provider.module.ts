import { DynamicModule, Logger, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { BaseProviderOptions, ProviderOptionsMap } from "./types";
import { OAUTH_PROVIDER_OPTIONS } from "./auth-provider-di-token";
import { GoogleStrategy } from "./strategies/google.strategy";
import { GithubStrategy } from "./strategies/github.strategy";
import { KakaoStrategy } from "./strategies/kakao.strategy";
import { DynamicAuthGuard } from "./guards/dynamic-auth.guard";

const logger = new Logger("AuthProviderModule");

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
  const enabledSet = new Set(enabled.map((v) => v.trim().toLowerCase()));

  logger.log(`📋 Environment ENABLED_PROVIDERS: ${env.ENABLED_PROVIDERS}`);
  logger.log(
    `🔧 Parsed enabled providers: ${Array.from(enabledSet).join(", ")}`,
  );

  // Google OAuth Configuration
  if (enabledSet.has(AuthProvider.GOOGLE)) {
    logger.log(`🔵 Configuring Google OAuth provider`);
    const missing: string[] = [];
    if (!env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
    if (!env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
    if (missing.length) {
      logger.error(`❌ Google OAuth missing env: ${missing.join(", ")}`);
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
    logger.log(
      `✅ Google OAuth configured - Callback: ${buildCallbackUrl(String(env.REDIRECT_BASE_URL), callbackPath)}`,
    );
  }

  // GitHub OAuth Configuration
  if (enabledSet.has(AuthProvider.GITHUB)) {
    logger.log(`🔵 Configuring GitHub OAuth provider`);
    const missing: string[] = [];
    if (!env.GITHUB_CLIENT_ID) missing.push("GITHUB_CLIENT_ID");
    if (!env.GITHUB_CLIENT_SECRET) missing.push("GITHUB_CLIENT_SECRET");
    if (missing.length) {
      logger.error(`❌ GitHub OAuth missing env: ${missing.join(", ")}`);
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
    logger.log(
      `✅ GitHub OAuth configured - Callback: ${buildCallbackUrl(String(env.REDIRECT_BASE_URL), callbackPath)}`,
    );
  }

  // Kakao OAuth Configuration
  if (enabledSet.has(AuthProvider.KAKAO)) {
    logger.log(`🔵 Configuring Kakao OAuth provider`);
    const missing: string[] = [];
    if (!env.KAKAO_CLIENT_ID) missing.push("KAKAO_CLIENT_ID");
    if (!env.KAKAO_CLIENT_SECRET) missing.push("KAKAO_CLIENT_SECRET");
    if (missing.length) {
      logger.error(`❌ Kakao OAuth missing env: ${missing.join(", ")}`);
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
    logger.log(
      `✅ Kakao OAuth configured - Callback: ${buildCallbackUrl(String(env.REDIRECT_BASE_URL), callbackPath)}`,
    );
  }

  if (providers.size === 0) {
    logger.warn(
      `⚠️ No OAuth providers configured! Check ENABLED_PROVIDERS environment variable.`,
    );
  } else {
    logger.log(`✅ Total ${providers.size} OAuth provider(s) configured`);
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
    logger.log(`🚀 Registering AuthProviderModule...`);

    // Strategy는 모두 등록하고, runtime에 OAUTH_PROVIDER_OPTIONS에서 필터링
    // 이렇게 하면 ConfigModule 초기화 순서 문제를 피할 수 있음
    const allStrategies = [GoogleStrategy, GithubStrategy, KakaoStrategy];

    logger.log(`📝 Registering all available strategies`);
    logger.log(
      `✅ Strategies registered: ${allStrategies.map((s) => s.name).join(", ")}`,
    );

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
            logger.log(`🔧 Assembling provider options from ConfigService`);
            const env =
              cfg.get<Record<string, any>>("", { infer: true }) || process.env;
            const options = assembleProviderOptions(env);

            // 실제로 활성화된 provider 로깅
            const enabledProviders = Array.from(options.keys());
            if (enabledProviders.length > 0) {
              logger.log(
                `✅ Active OAuth providers: ${enabledProviders.join(", ")}`,
              );
            }

            return options;
          },
        },
        ...allStrategies,
      ],
      exports: [OAUTH_PROVIDER_OPTIONS, DynamicAuthGuard, PassportModule],
    };
  }
}
