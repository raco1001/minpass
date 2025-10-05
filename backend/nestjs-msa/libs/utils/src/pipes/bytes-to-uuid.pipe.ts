import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";
import { validate, version } from "uuid";

@Injectable()
export class BytesToUuidPipe implements PipeTransform {
  transform(value: Uint8Array | Buffer | string) {
    if (typeof value === "string") {
      if (!validate(value) || version(value) !== 7)
        throw new BadRequestException("invalid uuid v7");
      return value.toLowerCase();
    }
    const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
    const hex = buf.toString("hex");
    const uuid =
      `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`.toLowerCase();
    if (!validate(uuid) || version(uuid) !== 7)
      throw new BadRequestException("invalid bytes for uuid v7");
    return uuid;
  }
}
