import { Module } from "@nestjs/common";

import { OntologyController } from "./presentation/web/controllers/ontology.controller";
import { OntologyService } from "./services/ontology.service";

@Module({
  imports: [],
  controllers: [OntologyController],
  providers: [OntologyService],
})
export class OntologyModule {}
