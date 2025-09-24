import { Test, TestingModule } from "@nestjs/testing";

import { OntologyController } from "./ontology.controller";
import { OntologyService } from "./services/ontology.service";

describe("OntologyController", () => {
  let ontologyController: OntologyController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OntologyController],
      providers: [OntologyService],
    }).compile();

    ontologyController = app.get<OntologyController>(OntologyController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(ontologyController.getHello()).toBe("Hello World!");
    });
  });
});
