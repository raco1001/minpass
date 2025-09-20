import { Controller, Get } from '@nestjs/common';
import { OntologyService } from './ontology.service';

@Controller()
export class OntologyController {
  constructor(private readonly ontologyService: OntologyService) {}

  @Get()
  getHello(): string {
    return this.ontologyService.getHello();
  }
}
