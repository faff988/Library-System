import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Force a fallback string with an empty password if process.env isn't loading right
    url: process.env["DATABASE_URL"],
  },
});