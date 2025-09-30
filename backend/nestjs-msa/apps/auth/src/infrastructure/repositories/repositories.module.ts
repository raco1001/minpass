import { Module } from "@nestjs/common";
import { MariadbRepositoryModule } from "./persistence/mariadb/mariadb.repository.module";

@Module({
  imports: [MariadbRepositoryModule],
  exports: [MariadbRepositoryModule],
})
export class RepositoriesModule {}
