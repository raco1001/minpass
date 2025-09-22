import { Purpose } from "../constants/consent.constants";
import { IConsentProps } from "../types/consent.types";

export class Consent {
  private props: IConsentProps;

  private constructor(props: IConsentProps) {
    if (!props.scope) throw new Error("Consent scope required");
    if (props.revokedAt && props.grantedAt) {
      throw new Error("Consent revokedAt must be null if grantedAt is true");
    }
    this.props = Object.freeze({ ...props });
  }

  static record(
    userId: string,
    id: string,
    purpose: Purpose,
    scope: string,
    grantedAt: Date,
    payloadHash?: string,
  ) {
    return new Consent({
      id,
      userId,
      purpose,
      scope,
      grantedAt,
      revokedAt: null,
      payloadHash,
    });
  }

  static restore(props: IConsentProps) {
    return new Consent(props);
  }

  revoke() {
    this.props = { ...this.props, revokedAt: new Date() };
  }

  get data() {
    return this.props;
  }
}
