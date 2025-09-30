import { Module } from "@nestjs/common";

import { ClientsModule } from "./clients/clients.module";
import { RepositoriesModule } from "./repositories/repositories.module";
@Module({
  imports: [ClientsModule, RepositoriesModule],
  exports: [ClientsModule, RepositoriesModule],
})
export class InfrastructureModule {}
