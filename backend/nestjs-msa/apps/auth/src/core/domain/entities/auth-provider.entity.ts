export enum AuthProviderType {
  GOOGLE = "google",
  GITHUB = "github",
}

export class AuthProvider {
  constructor(
    public readonly id: string,
    public readonly provider: AuthProviderType,
    public readonly imgUrl: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
