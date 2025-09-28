import { Injectable } from "@nestjs/common";

@Injectable()
export class OntologyService {
  getHello(): string {
    return "Hello World!";
  }
}
