import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // 1. 表结构在 shared 包里
  schema: "../../packages/shared/src/schema/rbac.ts",
  // 2. 迁移文件（SQL 补丁）输出到后端的哪个文件夹
  out: "./src/db/migrations",
  // 3. 选定为 PostgreSQL
  dialect: "postgresql",
  // 4. 数据库连接串
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:123456@localhost:5432/forge",
  },
  // 5. 打印严格的 SQL 日志
  verbose: true,
  strict: true,
});
