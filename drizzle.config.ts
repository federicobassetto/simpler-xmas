import { defineConfig } from "drizzle-kit";

const isProduction = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: isProduction
    ? {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: "file:./sqlite.db",
      },
});
