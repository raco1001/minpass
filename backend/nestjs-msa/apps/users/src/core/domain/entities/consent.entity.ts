import { Purpose } from "../constants/consent.constants";
import { IConsentProps } from "../constants/consent.props";
import { v7 as uuidv7 } from "uuid";

export class Consent {
  private props: IConsentProps;

  private constructor(props: IConsentProps) {
    if (!props.scope) throw new Error("Consent scope required");
    if (props.revokedAt && props.grantedAt) {
      throw new Error("Consent revokedAt must be null if grantedAt is true");
    }
    this.props = Object.freeze({ ...props });
  }

  static restore(props: IConsentProps) {
    return new Consent(props);
  }

  static record(
    userId: string,
    purpose: Purpose,
    scope: string,
    grantedAt: Date,
  ) {
    return new Consent({
      id: uuidv7(),
      userId,
      purpose,
      scope,
      grantedAt,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  revoke() {
    this.props = { ...this.props, revokedAt: new Date() };
  }

  get data() {
    return this.props;
  }
}
