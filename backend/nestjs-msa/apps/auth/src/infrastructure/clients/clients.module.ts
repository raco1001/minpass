import { Module } from "@nestjs/common";

import { UsersClientModule } from "./users-client/users.client.module";

@Module({
  imports: [UsersClientModule],
  exports: [UsersClientModule],
})
export class ClientsModule {}
