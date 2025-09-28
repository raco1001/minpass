import { performance } from "perf_hooks";

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class CommonLoggerInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();
    const start = performance.now();

    req.log.info(
      {
        category: "access",
        route: (req.originalUrl as string) || (req.url as string),
        service: process.env.SERVICE_NAME,
        env: process.env.NODE_ENV,
      },
      "request.start",
    );

    return next.handle().pipe(
      tap({
        next: () => {
          req.log.info(
            {
              category: "access",
              status: res.statusCode,
              durationMs: +(performance.now() - start).toFixed(1),
            },
            "request.ok",
          );
        },
        error: (err) => {
          req.log.error(
            {
              category: "access",
              status: res?.statusCode ?? 500,
              durationMs: +(performance.now() - start).toFixed(1),
              error: {
                name: err?.name,
                message: err?.message,
                stack: err?.stack,
              },
            },
            "request.error",
          );
        },
      }),
    );
  }
}
