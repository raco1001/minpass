import { Injectable } from "@nestjs/common";
import { HealthCheck } from "@nestjs/terminus";
import { HealthCheckResult } from "@nestjs/terminus/dist/health-check/health-check-result.interface";
import { Neo4jService } from "./neo4j.service";

@Injectable()
export class Neo4jHealthIndicator {
  constructor(private readonly neo4j: Neo4jService) {}

  @HealthCheck()
  async ping(): Promise<HealthCheckResult> {
    try {
      await this.neo4j.read("RETURN 1 AS ok");
      return {
        status: "ok",
        details: { neo4j: { status: "up" } },
      };
    } catch (e) {
      return {
        status: "error",
        details: { neo4j: { status: "down", error: String(e) } },
      };
    }
  }
}
