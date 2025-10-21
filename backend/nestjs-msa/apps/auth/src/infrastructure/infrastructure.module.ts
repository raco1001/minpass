import { Module } from "@nestjs/common";

import { ClientsModule } from "./clients/clients.module";
import { RepositoriesModule } from "./repositories/repositories.module";
import { TokensModule } from "./tokens/tokens.module";

@Module({
  imports: [ClientsModule, RepositoriesModule, TokensModule],
  exports: [ClientsModule, RepositoriesModule, TokensModule],
})
export class InfrastructureModule {}
