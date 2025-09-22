import { validate, version as uuidVersion } from "uuid";

export class UserId {
  private readonly buf: Buffer;

  private constructor(buf: Buffer) {
    if (!Buffer.isBuffer(buf) || buf.length !== 16) {
      throw new Error("UserId must be 16-byte buffer");
    }
    this.buf = Buffer.from(buf);
  }

  static fromString(uuid: string): UserId {
    if (!validate(uuid) || uuidVersion(uuid) !== 7) {
      throw new Error(`Invalid UUIDv7: ${uuid}`);
    }
    return new UserId(Buffer.from(uuid.replace(/-/g, ""), "hex"));
  }

  static fromBuffer(buf: Buffer): UserId {
    const id = new UserId(buf);
    if (!validate(id.toString()) || uuidVersion(id.toString()) !== 7) {
      throw new Error("Buffer is not a valid UUIDv7");
    }
    return id;
  }

  toBuffer(): Buffer {
    return Buffer.from(this.buf);
  }

  toString(): string {
    const h = this.buf.toString("hex");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`.toLowerCase();
  }

  equals(other: UserId): boolean {
    return this.buf.equals(other.buf);
  }

  short(): string {
    return this.toString().slice(0, 8);
  }
}
