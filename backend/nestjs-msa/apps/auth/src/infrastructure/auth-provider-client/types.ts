import { OAuthProvider } from "../../core/domain/constants/auth-providers";

export interface BaseProviderOptions {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope?: string[];
}

export type ProviderOptionsMap = Map<OAuthProvider, BaseProviderOptions>;
