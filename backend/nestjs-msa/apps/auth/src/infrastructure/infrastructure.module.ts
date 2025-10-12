import { Module } from "@nestjs/common";

import { ClientsModule } from "./clients/clients.module";
import { RepositoriesModule } from "./repositories/repositories.module";
import { AuthProviderClientModule } from "./auth-provider-client/auth-provider-client.module";
import { TokensModule } from "./tokens/tokens.module";

@Module({
  imports: [
    ClientsModule,
    RepositoriesModule,
    TokensModule,
    AuthProviderClientModule.register(),
  ],
  exports: [
    ClientsModule,
    RepositoriesModule,
    TokensModule,
    AuthProviderClientModule,
  ],
})
export class InfrastructureModule {}
