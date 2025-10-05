import { users } from "@app/contracts";

import { Purpose as PurposeEnum } from "@users/core/domain/constants/consent.constants";
import { Consent as ConsentEntity } from "@users/core/domain/entities/consent.entity";
import { User as UserEntity } from "@users/core/domain/entities/user.entity";
import { CreateConsentDto } from "@users/core/dtos/consent.dtos";
import {
  CreateUserDto,
  FindOneUserDto,
  UpdateUserDto,
} from "@users/core/dtos/user.dtos";

export class PurposeMapper {
  static toPurpose(purpose: users.Purpose): string {
    switch (purpose) {
      case users.Purpose.PURPOSE_TERMS:
        return users.Purpose.PURPOSE_TERMS.toString();
      case users.Purpose.PURPOSE_PRIVACY:
        return users.Purpose.PURPOSE_PRIVACY.toString();
      case users.Purpose.PURPOSE_MARKETING:
        return users.Purpose.PURPOSE_MARKETING.toString();
      default:
        throw new Error("Invalid purpose");
    }
  }

  static toPurposeEnum(purpose: PurposeEnum): string {
    switch (purpose) {
      case "tos":
        return users.Purpose.PURPOSE_TERMS.toString();
      case "privacy":
        return users.Purpose.PURPOSE_PRIVACY.toString();
      case "marketing":
        return users.Purpose.PURPOSE_MARKETING.toString();
    }
  }
}

export class UsersControllerMapper {
  static toUserResponse(user: UserEntity): users.User {
    return {
      id: user.id,
      email: user.email,
      locale: user.locale,
      displayName: user.displayName ?? "",
      createdAt: user.createdAt.toISOString() ?? "",
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toUserListResponse(users: UserEntity[]): users.UserList {
    return {
      users: users.map((user) => this.toUserResponse(user)),
    };
  }

  static toConsentResponse(consent: ConsentEntity): users.Consent {
    return {
      id: consent.data.id.toString(),
      userId: consent.data.userId,
      purpose: PurposeMapper.toPurposeEnum(
        consent.data.purpose as PurposeEnum,
      ) as users.Purpose,
      scope: consent.data.scope,
      grantedAt: consent.data.grantedAt.toISOString(),
      revokedAt: consent.data.revokedAt?.toISOString() ?? "",
      createdAt: consent.data.createdAt.toISOString(),
      updatedAt: consent.data.updatedAt.toISOString(),
    };
  }
  static toConsentsResponse(consents: ConsentEntity[]): users.ConsentList {
    return {
      consents: consents.map((c) => this.toConsentResponse(c)),
    };
  }

  static toFindOneUserDto(request: users.FindOneUserRequest): FindOneUserDto {
    return {
      id: request.id,
    };
  }
  static toCreateUserDto(request: users.CreateUserRequest): CreateUserDto {
    return {
      email: request.email,
      locale: request.locale,
      displayName: request.displayName ?? undefined,
    };
  }

  static toUpdateUserDto(request: users.UpdateUserRequest): UpdateUserDto {
    return {
      id: request.id,
      displayName: request.displayName ?? "",
    };
  }

  static toCreateConsentDto(
    request: users.RecordConsentRequest,
  ): CreateConsentDto {
    return {
      userId: request.userId,
      purpose: PurposeMapper.toPurpose(request.purpose),
      scope: request.scope,
      grantedAt: new Date(),
      revokedAt: undefined,
    };
  }
}
