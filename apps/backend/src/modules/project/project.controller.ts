import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.js";
import { getDataScopeDeptIds } from "../../utils/data-scope.js";
import { projects, users, departments } from "@forge/shared";
import { db } from "../../db/index.js";
import { eq, inArray, and } from "drizzle-orm";

const app = new OpenAPIHono();

app.use("*", authMiddleware);

const listRoute = createRoute({
  method: "get",
  path: "/list",
  summary: "查询项目列表（演示行级数据隔离权限）",
  tags: ["项目管理 Project"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            code: z.number(),
            data: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                creator: z.object({
                  username: z.string(),
                  nickname: z.string().nullable(),
                }),
                department: z.object({
                  name: z.string(),
                }),
                createdAt: z.string(),
              }),
            ),
          }),
        },
      },
      description: "成功返回经过数据权限过滤的项目列表",
    },
  },
});

const routes = app.openapi(listRoute, async (c) => {
  const currentUser = c.get("currentUser");

  const scope = await getDataScopeDeptIds(currentUser);

  const whereClauses = [];

  if (scope === "self") {
    whereClauses.push(eq(projects.creatorId, currentUser.id));
  } else if (Array.isArray(scope)) {
    whereClauses.push(inArray(projects.departmentId, scope));
  }

  const list = await db
    .select({
      id: projects.id,
      name: projects.name,
      creator: {
        username: users.username,
        nickname: users.nickname,
      },
      department: {
        name: departments.name,
      },
      createdAt: projects.createdAt,
    })
    .from(projects)
    .innerJoin(users, eq(projects.creatorId, users.id))
    .innerJoin(departments, eq(projects.departmentId, departments.id))
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(projects.id);

  return c.json(
    {
      code: 0,
      data: list,
    },
    200,
  );
});

export default routes;
