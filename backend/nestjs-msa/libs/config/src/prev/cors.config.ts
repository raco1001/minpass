import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export const corsConfig = (): CorsOptions => ({
  origin: process.env.CORS_ORIGIN || "http://localhost:30040",
  methods: process.env.CORS_METHODS?.split(",") || [
    "GET",
    "HEAD",
    "PUT",
    "PATCH",
    "POST",
    "DELETE",
  ],
  credentials: process.env.CORS_CREDENTIALS === "true",
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600,
});
