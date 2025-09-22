import { v7 as uuidv7, validate, version } from "uuid";

export function generateUuidV7(): string {
  return uuidv7();
}

export function uuidToBin(uuidStr: string): Buffer {
  if (!validate(uuidStr)) {
    throw new Error(`Invalid UUID string: ${uuidStr}`);
  }

  if (version(uuidStr) !== 7) {
    throw new Error(`UUID is not v7: ${uuidStr}`);
  }
  const hex = uuidStr.replace(/-/g, "");
  return Buffer.from(hex, "hex");
}

export function binToUuid(buf: Buffer): string {
  if (!Buffer.isBuffer(buf) || buf.length !== 16) {
    throw new Error("binToUuid expects 16-byte Buffer");
  }
  const hex = buf.toString("hex");

  return (
    hex.slice(0, 8) +
    "-" +
    hex.slice(8, 12) +
    "-" +
    hex.slice(12, 16) +
    "-" +
    hex.slice(16, 20) +
    "-" +
    hex.slice(20)
  ).toLowerCase();
}

export function assertRoundTrip() {
  const u = generateUuidV7();
  const b = uuidToBin(u);
  const u2 = binToUuid(b);
  if (u !== u2) throw new Error(`UUID roundtrip failed: ${u} != ${u2}`);
}
