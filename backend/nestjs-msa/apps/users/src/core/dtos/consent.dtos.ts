import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateConsentDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  readonly purpose: string;

  @IsNotEmpty()
  @IsString()
  readonly scope: string;

  @IsOptional()
  @IsDate()
  readonly grantedAt?: Date;

  @IsOptional()
  @IsDate()
  readonly revokedAt?: Date;
}
