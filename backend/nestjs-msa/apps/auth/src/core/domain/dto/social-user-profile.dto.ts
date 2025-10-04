import { OAuthProvider } from "../constants/auth-providers";
import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsNotEmpty,
} from "class-validator";
/**
 * @description 모든 소셜 로그인 Strategy가 반환해야 하는 표준화된 프로필 형식
 * OAuth 콜백에서만 사용됨
 */
export class SocialUserProfile {
  @IsString()
  @IsNumber()
  @IsNotEmpty()
  clientId: string | number;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string | null;
  @IsString()
  nickname: string;
  @IsString()
  profileImage: string;
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider;
  @IsString()
  providerAccessToken: string;
  @IsString()
  providerRefreshToken: string;
}
