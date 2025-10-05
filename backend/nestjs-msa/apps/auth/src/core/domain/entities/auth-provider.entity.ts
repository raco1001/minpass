import { AuthProvider } from "../constants/auth-providers";

export class AuthProviderEntity {
  constructor(
    public readonly id: string,
    public readonly provider: AuthProvider,
    public readonly imgUrl: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
