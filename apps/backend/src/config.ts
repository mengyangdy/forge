import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL 格式不合法")
    .default("postgres://dylan:123456@localhost:5432/forge"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(8, "JWT Access Secret 最少 8 位")
    .default("forge-super-access-secret-2026"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(8, "JWT Refresh Secret 最少 8 位")
    .default("forge-super-refresh-secret-2026"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().url("REDIS_URL 格式不合法").default("redis://127.0.0.1:6379"),
  UPLOAD_PROVIDER: z.enum(["local", "alioss"]).default("local"),
  ALIOSS_ACCESS_KEY_ID: z.string().optional(),
  ALIOSS_ACCESS_KEY_SECRET: z.string().optional(),
  ALIOSS_BUCKET: z.string().optional(),
  ALIOSS_REGION: z.string().optional(),
});

const parseResult = configSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("❌ 环境变量校验失败，应用拒绝启动！具体错误：");
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  process.exit(1);
}

export const env = parseResult.data;
export type EnvConfig = z.infer<typeof configSchema>;
