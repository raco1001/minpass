import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import type { Pool } from "mysql2/promise";

@Injectable()
export class MariaDbPoolShutdown implements OnApplicationShutdown {
  private readonly logger = new Logger(MariaDbPoolShutdown.name);

  constructor(
    private readonly pool: Pool,
    private readonly name: string,
  ) {}

  async onApplicationShutdown(signal?: string) {
    try {
      this.logger.log(
        `[${this.name}] closing MariaDB pool... signal=${signal ?? "N/A"}`,
      );
      await this.pool.end();
      this.logger.log(`[${this.name}] MariaDB pool closed.`);
    } catch (e) {
      this.logger.error(
        `[${this.name}] pool close failed: ${(e as Error).message}`,
        e as any,
      );
    }
  }
}
