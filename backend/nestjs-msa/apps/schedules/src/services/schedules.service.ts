import { Injectable } from "@nestjs/common";

@Injectable()
export class SchedulesService {
  getHello(): string {
    return "Hello World!";
  }
}
