import { Module } from "@nestjs/common";

import { UsersClientModule } from "./clients/users-client/users-client.module";

@Module({
  imports: [UsersClientModule],
  exports: [UsersClientModule],
})
export class PresentationModule {}
