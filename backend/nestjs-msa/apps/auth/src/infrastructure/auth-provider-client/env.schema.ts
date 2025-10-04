import { plainToInstance, Transform } from "class-transformer";
import { IsOptional, IsString, IsUrl, validateSync } from "class-validator";
import { OAuthProvider } from "@src/core/domain/constants/auth-providers";

export class EnvSchema {
  @IsString()
  NODE_ENV!: "development" | "test" | "production";

  @IsUrl({ require_tld: false })
  REDIRECT_BASE_URL!: string;

  @IsOptional()
  @Transform(({ value }) =>
    String(value ?? "")
      .split(",")
      .map((v) => v.trim() as OAuthProvider)
      .filter(Boolean),
  )
  ENABLED_PROVIDERS?: OAuthProvider[];

  @IsOptional() @IsString() GOOGLE_CLIENT_ID?: string;
  @IsOptional() @IsString() GOOGLE_CLIENT_SECRET?: string;
  @IsOptional() @IsString() GOOGLE_CALLBACK_PATH?: string;

  @IsOptional() @IsString() GITHUB_CLIENT_ID?: string;
  @IsOptional() @IsString() GITHUB_CLIENT_SECRET?: string;
  @IsOptional() @IsString() GITHUB_CALLBACK_PATH?: string;

  @IsOptional() @IsString() KAKAO_CLIENT_ID?: string;
  @IsOptional() @IsString() KAKAO_CLIENT_SECRET?: string;
  @IsOptional() @IsString() KAKAO_CALLBACK_PATH?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvSchema {
  const inst = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(inst, { skipMissingProperties: false });
  if (errors.length) {
    throw new Error(
      "Invalid environment variables: " + JSON.stringify(errors, null, 2),
    );
  }
  return inst;
}
