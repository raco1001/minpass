import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  ForbiddenException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { OAUTH_PROVIDER_OPTIONS } from "@apis/infrastructure/auth-provider/auth-provider-di-token";
import { ProviderOptionsMap } from "@apis/infrastructure/auth-provider/types";

interface RequestWithProvider {
  params: {
    provider?: string;
    [key: string]: any;
  };
  path?: string;
}

@Injectable()
export class DynamicAuthGuard implements CanActivate {
  private readonly logger = new Logger(DynamicAuthGuard.name);

  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    private readonly providerOptions: ProviderOptionsMap,
  ) {
    // Guard 초기화 시 등록된 provider 목록 로깅
    const enabledProviders = Array.from(this.providerOptions.keys());
    this.logger.log(
      `✅ Initialized with providers: ${enabledProviders.join(", ")}`,
    );
  }

  canActivate(context: ExecutionContext) {
    const request: RequestWithProvider = context.switchToHttp().getRequest();

    if (!request) {
      this.logger.warn("⚠️ No HTTP request found");
      return true;
    }

    if (context.getType() === "ws") {
      this.logger.debug("🔌 WebSocket request, skipping auth");
      return true;
    }

    const { provider } = request.params;
    const requestPath = request.path;

    this.logger.log(
      `🔐 Auth request - Path: ${requestPath}, Provider: ${provider}`,
    );

    // Provider 파라미터 검증
    if (!provider) {
      this.logger.error(
        `❌ No provider parameter found in request. Path: ${requestPath}`,
      );
      throw new ForbiddenException(
        "OAuth provider is required. Please specify a provider (google, github, kakao)",
      );
    }

    // Provider 유효성 검증
    if (!this.isValidProvider(provider)) {
      const availableProviders = Array.from(this.providerOptions.keys()).join(
        ", ",
      );
      this.logger.error(
        `❌ Invalid provider: "${provider}". Available providers: ${availableProviders}`,
      );
      throw new ForbiddenException(
        `Invalid OAuth provider: "${provider}". Available providers: ${availableProviders}`,
      );
    }

    this.logger.log(
      `✅ Provider "${provider}" is valid, delegating to Passport`,
    );

    try {
      // Passport Guard에 위임
      const result = new (AuthGuard(provider))().canActivate(context);
      this.logger.debug(`🔑 Passport Guard result for ${provider}: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(
        `❌ Passport Guard failed for ${provider}: ${error.message}`,
        error.stack,
      );
      throw new ForbiddenException(
        `OAuth authentication failed for ${provider}: ${error.message}`,
      );
    }
  }

  private isValidProvider(provider: string): provider is AuthProvider {
    return this.providerOptions.has(provider as AuthProvider);
  }
}
