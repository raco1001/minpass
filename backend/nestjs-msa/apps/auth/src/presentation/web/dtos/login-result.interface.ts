export interface ILoginResult {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser: boolean;
}
