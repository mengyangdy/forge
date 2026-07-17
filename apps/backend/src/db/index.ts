import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@forge/shared"; // 🚀 降维打击：直接把 shared 里的表和关系声明打包全量引入
import { env } from "../config.js";

const connectionString = env.DATABASE_URL;

// 创建高性能 PostgreSQL 连接池
const pool = new Pool({
  connectionString,
  max: 20, // 最大物理连接数
  idleTimeoutMillis: 30000, // 一个连接空闲 30 秒后自动释放
  connectionTimeoutMillis: 2000, // 获取连接的超时时间 2 秒
});

// 🛠️ 架构师的小倔强：在系统启动时自动获取一次连接校验，防止带着断网暗病运行
pool
  .query("SELECT 1")
  .then(() => console.log("🚀 [Forge DB] PostgreSQL 高性能连接池钢铁地基连接成功！"))
  .catch((err: unknown) => console.error("❌ [Forge DB] 数据库连接池初始化失败，请检查配置:", err));

// 导出 100% 强类型安全的 db 实例
export const db = drizzle(pool, { schema });
