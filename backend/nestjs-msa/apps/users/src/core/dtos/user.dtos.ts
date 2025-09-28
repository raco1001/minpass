import { IsNotEmpty, IsString, IsEmail, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly locale: string;

  @IsString()
  @IsOptional()
  readonly displayName?: string;
}

export class FindOneUserDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;
}

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly displayName: string;
}
