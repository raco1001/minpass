import { v7 as uuidv7 } from "uuid";
import { UserStatus } from "../constants/user.constants";
import { IUserProps } from "../types/user.types";

export class User {
  private props: IUserProps;

  private constructor(props: IUserProps) {
    if (!props.email.includes("@")) throw new Error("Invalid email");
    if (props.deletedAt && props.status !== UserStatus.Deleted) {
      if (!props.locale) throw new Error("Locale is required");
      throw new Error("Deleted user must have status=deleted");
    }
    this.props = Object.freeze({
      ...props,
      deletedAt: props.deletedAt ?? null,
    });
  }

  static restore(props: IUserProps) {
    return new User(props);
  }

  static createNew(email: string, locale: string, displayName?: string) {
    return new User({
      id: uuidv7(),
      email,
      displayName,
      status: UserStatus.Active,
      locale,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  changeDisplayName(name: string) {
    if (!name || name.length < 2) throw new Error("Too short displayName");
    this.props = { ...this.props, displayName: name, updatedAt: new Date() };
  }

  softDelete() {
    this.props = {
      ...this.props,
      status: UserStatus.Deleted,
      deletedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  changeStatus(status: UserStatus) {
    this.props = { ...this.props, status, updatedAt: new Date() };
  }

  get id(): string {
    return this.props.id.toString();
  }
  get email(): string {
    return this.props.email;
  }
  get displayName(): string | null {
    return this.props.displayName ?? null;
  }
  get status(): UserStatus {
    return this.props.status;
  }
  get locale(): string {
    return this.props.locale;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get deletedAt(): Date | null {
    return this.props.deletedAt ?? null;
  }
}
