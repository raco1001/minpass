import {
  Purpose as PurposeEnum,
  RecordConsentRequest,
} from "../../../../../../libs/contracts/generated/users/v1/consents";
import {
  Consent,
  ConsentList,
} from "../../../../../../libs/contracts/generated/users/v1/consents";
import {
  CreateUserRequest,
  FindOneUserRequest,
  UpdateUserRequest,
  User,
  UserList,
} from "../../../../../../libs/contracts/generated/users/v1/users";
import { Purpose } from "../../../core/domain/constants/consent.constants";
import { Consent as ConsentEntity } from "../../../core/domain/entities/consent.entity";
import { User as UserEntity } from "../../../core/domain/entities/user.entity";
import { CreateConsentDto } from "../../../core/dtos/consent.dtos";
import {
  CreateUserDto,
  FindOneUserDto,
  UpdateUserDto,
} from "../../../core/dtos/user.dtos";

export class PurposeMapper {
  static toPurpose(purpose: PurposeEnum): Purpose {
    switch (purpose) {
      case PurposeEnum.PURPOSE_TERMS:
        return "tos";
      case PurposeEnum.PURPOSE_PRIVACY:
        return "privacy";
      case PurposeEnum.PURPOSE_MARKETING:
        return "marketing";
      default:
        throw new Error("Invalid purpose");
    }
  }

  static toPurposeEnum(purpose: Purpose): PurposeEnum {
    switch (purpose) {
      case "tos":
        return PurposeEnum.PURPOSE_TERMS;
      case "privacy":
        return PurposeEnum.PURPOSE_PRIVACY;
      case "marketing":
        return PurposeEnum.PURPOSE_MARKETING;
    }
  }
}

export class UsersControllerMapper {
  static toUserResponse(user: UserEntity): User {
    return {
      id: user.id,
      email: user.email,
      locale: user.locale,
      displayName: user.displayName ?? "",
      createdAt: user.createdAt.toISOString() ?? "",
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toUserListResponse(users: UserEntity[]): UserList {
    return {
      users: users.map((user) => this.toUserResponse(user)),
    };
  }

  static toConsentResponse(consent: ConsentEntity): Consent {
    return {
      id: consent.data.id.toString(),
      userId: consent.data.userId,
      purpose: PurposeMapper.toPurposeEnum(consent.data.purpose),
      scope: consent.data.scope,
      grantedAt: consent.data.grantedAt.toISOString(),
      revokedAt: consent.data.revokedAt?.toISOString() ?? "",
      createdAt: consent.data.createdAt.toISOString(),
      updatedAt: consent.data.updatedAt.toISOString(),
    };
  }
  static toConsentsResponse(consents: ConsentEntity[]): ConsentList {
    return {
      consents: consents.map((c) => this.toConsentResponse(c)),
    };
  }

  static toFindOneUserDto(request: FindOneUserRequest): FindOneUserDto {
    return {
      id: request.id,
    };
  }
  static toCreateUserDto(request: CreateUserRequest): CreateUserDto {
    return {
      email: request.email,
      locale: request.locale,
      displayName: request.displayName ?? undefined,
    };
  }

  static toUpdateUserDto(request: UpdateUserRequest): UpdateUserDto {
    return {
      id: request.id,
      displayName: request.displayName ?? "",
    };
  }

  static toCreateConsentDto(request: RecordConsentRequest): CreateConsentDto {
    return {
      userId: request.userId,
      purpose: PurposeMapper.toPurpose(request.purpose),
      scope: request.scope,
      grantedAt: new Date(),
      revokedAt: undefined,
    };
  }
}
