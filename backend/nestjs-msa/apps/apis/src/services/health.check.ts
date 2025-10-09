import { Injectable } from "@nestjs/common";

@Injectable()
export class ApisService {
  getHello(): string {
    return "Hello World!";
  }
}
