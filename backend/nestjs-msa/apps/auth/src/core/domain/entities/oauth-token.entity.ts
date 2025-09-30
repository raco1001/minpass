export class OAuthToken {
  constructor(
    public readonly id: string,
    public readonly oauthClientId: string,
    public readonly providerAccessToken: string,
    public readonly providerRefreshToken: string,
    public readonly refreshToken: string,
    private _revoked = false,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  revoke() {
    this._revoked = true;
  }

  get revoked() {
    return this._revoked;
  }
}
