import { customType } from "drizzle-orm/mysql-core";
import { validate } from "uuid";

/**
 * Converts a UUID string to a 16-byte Buffer
 * Accepts any valid UUID format (v1, v4, v7, etc.)
 */
function uuidToBuf(u: string): Buffer {
  if (!validate(u)) {
    throw new Error(`Invalid UUID format: ${u}`);
  }
  return Buffer.from(u.replace(/-/g, ""), "hex");
}

/**
 * Converts a 16-byte Buffer to UUID string
 */
function bufToUuid(buf: Buffer): string {
  if (!Buffer.isBuffer(buf) || buf.length !== 16) {
    throw new Error("Expected 16-byte Buffer");
  }
  const h = buf.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`.toLowerCase();
}

/**
 * Drizzle custom type for UUID stored as binary(16)
 * Works with any UUID version (v1, v4, v7, etc.)
 *
 * Note: This accepts any UUID version for backward compatibility,
 * but you should generate new UUIDs using v7 for better performance
 * and time-sortability.
 */
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
