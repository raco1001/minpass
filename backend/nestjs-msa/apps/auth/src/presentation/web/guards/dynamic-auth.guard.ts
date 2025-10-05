import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { OAUTH_PROVIDER_OPTIONS } from "@auth/infrastructure/auth-provider-client/auth-provider-client-di-token";
import { ProviderOptionsMap } from "@auth/infrastructure/auth-provider-client/types";

interface RequestWithProvider {
  params: {
    provider?: string;
    [key: string]: any;
  };
}

@Injectable()
export class DynamicAuthGuard implements CanActivate {
  constructor(
    @Inject(OAUTH_PROVIDER_OPTIONS)
    private readonly providerOptions: ProviderOptionsMap,
  ) {}

  canActivate(context: ExecutionContext) {
    if (!context.switchToHttp().getRequest()) {
      return true;
    }

    if (context.getType() === "ws") {
      return true;
    }

    const request: RequestWithProvider = context.switchToHttp().getRequest();
    const { provider } = request.params;

    if (!provider) {
      return false;
    }

    if (!this.isValidProvider(provider)) {
      return false;
    }

    return new (AuthGuard(provider))(context).canActivate(context);
  }

  private isValidProvider(provider: string): provider is AuthProvider {
    return this.providerOptions.has(provider as AuthProvider);
  }
}
