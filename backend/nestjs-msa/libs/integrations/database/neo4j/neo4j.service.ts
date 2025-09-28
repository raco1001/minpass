import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Driver, Session } from "neo4j-driver";

import { NEO4J_DRIVER, NEO4J_CONFIG } from "./constants/neo4j.constants";
import { Neo4jModuleOptions } from "./constants/neo4j.types";

@Injectable()
export class Neo4jService implements OnModuleInit {
  constructor(
    @Inject(NEO4J_DRIVER) private readonly driver: Driver,
    @Inject(NEO4J_CONFIG) private readonly opts: Neo4jModuleOptions,
  ) {}

  async onModuleInit() {
    await this.read("RETURN 1 AS ok");
  }

  private openSession(accessMode: "READ" | "WRITE" = "WRITE"): Session {
    return this.driver.session({
      database: this.opts.database,
      defaultAccessMode: accessMode,
    });
  }

  async read<T = any>(
    cypher: string,
    params?: Record<string, any>,
  ): Promise<T[]> {
    const s = this.openSession("READ");
    try {
      const res = await s.run(cypher, params);
      return res.records.map((r) => r.toObject()) as T[];
    } finally {
      await s.close();
    }
  }

  async write<T = any>(
    cypher: string,
    params?: Record<string, any>,
  ): Promise<T[]> {
    const s = this.openSession("WRITE");
    try {
      const res = await s.run(cypher, params);
      return res.records.map((r) => r.toObject()) as T[];
    } finally {
      await s.close();
    }
  }

  async tx<T>(work: (tx: any) => Promise<T>): Promise<T> {
    const s = this.openSession("WRITE");
    const tx = s.beginTransaction();
    try {
      const out = await work(tx);
      await tx.commit();
      return out;
    } catch (e) {
      await tx.rollback();
      throw e;
    } finally {
      await s.close();
    }
  }

  async close() {
    await this.driver.close();
  }
}
