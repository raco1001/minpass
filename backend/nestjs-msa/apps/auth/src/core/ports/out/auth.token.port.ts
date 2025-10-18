import { User } from "@app/contracts/generated/users/v1/users";
import { TokensEntity } from "@auth/core/domain/entities/token.entity";

export abstract class AuthTokenPort {
  abstract generateTokens(user: {
    userId: User["id"];
    email: User["email"];
  }): Promise<TokensEntity>;
}
