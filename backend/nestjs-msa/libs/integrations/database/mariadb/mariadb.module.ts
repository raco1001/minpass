import { DynamicModule, Module } from "@nestjs/common";
import { createMariaDbProviders } from "./mariadb.provider";
import { MARIADB_OPTIONS } from "./constants/mariadb.constants";
import { MariaDbOptions } from "./constants/mariadb.types";

@Module({})
export class MariaDbModule {
  static register(options: MariaDbOptions): DynamicModule {
    const name = options.name ?? "default";
    return {
      module: MariaDbModule,
      providers: [
        { provide: MARIADB_OPTIONS(name), useValue: options },
        ...createMariaDbProviders(name),
      ],
      exports: createMariaDbProviders(name).map(
        (p) => (p as { provide: string }).provide,
      ),
    };
  }

  static registerAsync(
    name: string,
    useFactory: (...args: any[]) => Promise<MariaDbOptions> | MariaDbOptions,
    inject: any[] = [],
    imports: any[] = [],
  ): DynamicModule {
    return {
      module: MariaDbModule,
      imports,
      providers: [
        { provide: MARIADB_OPTIONS(name), useFactory, inject },
        ...createMariaDbProviders(name),
      ],
      exports: createMariaDbProviders(name).map(
        (p) => (p as { provide: string }).provide,
      ),
    };
  }
}
