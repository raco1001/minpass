import { AuthProvider } from "./auth-provider.entity";
import { OAuthToken } from "./oauth-token.entity";

import crypto from "crypto";
export class OAuthClient {
  constructor(
    public readonly id: string | null = null,
    public readonly userId: string,
    public readonly providerId: string,
    public readonly clientId: string,
    public readonly salt: string = crypto.randomBytes(16).toString(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    private provider: AuthProvider | null = null,
    private token: OAuthToken | null = null,
  ) {}

  attachToken(token: OAuthToken) {
    this.token = token;
  }

  attachProvider(provider: AuthProvider) {
    this.provider = provider;
  }
  revokeToken() {
    if (!this.token) throw new Error("No token to revoke");
    this.token.revoke();
  }

  getToken(): OAuthToken | null {
    return this.token;
  }

  getProvider(): AuthProvider | null {
    return this.provider;
  }
}
