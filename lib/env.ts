import { z } from "zod";

/**
 * Server-side environment configuration.
 *
 * Single source of truth for env vars. Validated once at module load so the
 * app/worker fail fast with a clear message instead of throwing deep in a
 * request. Never import this from client components — it reads server secrets.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Database (Phase 0)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1).optional(),

  // Redis / queue (Phase 0)
  REDIS_URL: z.string().min(1, "REDIS_URL is required"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().min(1).default("http://localhost:3000"),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  AUTH_ENCRYPTION_KEY: z.string().min(1).optional(),

  // Worker liveness key shared between worker (writer) and health check (reader)
  WORKER_HEARTBEAT_KEY: z.string().min(1).default("helpdesk:worker:heartbeat"),

  // Port for the worker's /healthz server (Railway healthcheck). Railway injects
  // PORT; fall back to WORKER_PORT then 8080.
  WORKER_PORT: z.coerce.number().int().positive().default(8080),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env: Env = loadEnv();

// `pnpm check:env` runs this file directly via tsx.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  // eslint-disable-next-line no-console
  console.log("✅ Environment variables are valid.");
}
