import { customType } from "drizzle-orm/mysql-core";
import { validate, version as uuidVersion } from "uuid";

function uuidToBuf(u: string): Buffer {
  if (!validate(u) || uuidVersion(u) !== 7) {
    throw new Error(`Invalid UUIDv7: ${u}`);
  }
  return Buffer.from(u.replace(/-/g, ""), "hex");
}

function bufToUuid(buf: Buffer): string {
  if (!Buffer.isBuffer(buf) || buf.length !== 16) {
    throw new Error("Expected 16-byte Buffer");
  }
  const h = buf.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`.toLowerCase();
}

export const uuidv7Binary = customType<{
  data: string;
  driverData: Buffer;
  config: { length?: number };
}>({
  dataType(config) {
    const len = config?.length ?? 16;
    return `binary(${len})`;
  },
  toDriver(value: string) {
    return uuidToBuf(value);
  },
  fromDriver(value: Buffer) {
    return bufToUuid(value);
  },
});
