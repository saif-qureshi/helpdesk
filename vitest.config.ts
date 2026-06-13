import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      REDIS_URL: "redis://localhost:6379",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
});
