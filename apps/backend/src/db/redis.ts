import { Redis } from "ioredis";

import { env } from "../config.js";

export const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
  console.log("📝 [Redis] 已成功建立连接");
});

redis.on("error", (err: any) => {
  console.error("❌ [Redis] 连接错误:", err);
});
