import { Module } from "@nestjs/common";

import { ClientsModule } from "./clients/clients.module";
import { RepositoriesModule } from "./repositories/repositories.module";
import { AuthProviderClientModule } from "./auth-provider-client/auth-provider-client.module";
@Module({
  imports: [
    ClientsModule,
    RepositoriesModule,
    AuthProviderClientModule.register(),
  ],
  exports: [ClientsModule, RepositoriesModule, AuthProviderClientModule],
})
export class InfrastructureModule {}
