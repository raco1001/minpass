import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

interface PaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
  optional?: boolean;
}

export interface PaginationMeta {
  skip: number;
  take: number;
  page: number;
  limit: number;
  enabled: boolean;
}

function parseQueryParam(value: unknown, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (value === "") {
    return defaultValue;
  }

  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && isFinite(parsed) ? parsed : defaultValue;
  }

  if (Array.isArray(value)) {
    const firstValue = value[0];
    return parseQueryParam(firstValue, defaultValue);
  }

  return defaultValue;
}

export const Pagination = createParamDecorator(
  (options: PaginationOptions = {}, ctx: ExecutionContext): PaginationMeta => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const defaultPage = options.defaultPage || 1;
    const defaultLimit = options.defaultLimit || 10;
    const maxLimit = options.maxLimit || 100;
    const optional = options.optional || false;

    const hasPageParam = req.query.page !== undefined && req.query.page !== "";
    const hasLimitParam =
      req.query.limit !== undefined && req.query.limit !== "";

    if (optional && !hasPageParam && !hasLimitParam) {
      return {
        skip: 0,
        take: 0,
        page: 0,
        limit: 0,
        enabled: false,
      };
    }

    let pageNum = parseQueryParam(req.query.page, defaultPage);
    let limitNum = parseQueryParam(req.query.limit, defaultLimit);

    if (pageNum < 1) pageNum = defaultPage;
    if (limitNum < 1 || limitNum > maxLimit) limitNum = defaultLimit;

    return {
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      page: pageNum,
      limit: limitNum,
      enabled: true,
    };
  },
);
