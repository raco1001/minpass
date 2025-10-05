import { Module } from "@nestjs/common";
import { MariaDbModule } from "./mariadb/mariadb.module";

@Module({
  imports: [MariaDbModule],
  exports: [MariaDbModule],
})
export class IntegrationsModule {}
