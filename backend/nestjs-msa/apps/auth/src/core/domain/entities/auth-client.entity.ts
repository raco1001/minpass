import { AuthProviderEntity } from "./auth-provider.entity";

export class AuthClientEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly providerId: AuthProviderEntity["id"],
    public readonly clientId: string,
    public readonly salt: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
