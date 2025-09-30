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
  ) {}
}
