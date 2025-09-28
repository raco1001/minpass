import { Controller, Get } from "@nestjs/common";

import { OntologyService } from "../../../services/ontology.service";

@Controller()
export class OntologyController {
  constructor(private readonly ontologyService: OntologyService) {}

  @Get()
  getHello(): string {
    return this.ontologyService.getHello();
  }
}
