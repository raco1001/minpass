import { AuthProvider } from "../../core/domain/constants/auth-providers";

export interface BaseProviderOptions {
  provider: AuthProvider;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope?: string[];
}

export type ProviderOptionsMap = Map<AuthProvider, BaseProviderOptions>;
