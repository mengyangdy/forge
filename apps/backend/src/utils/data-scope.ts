import { db } from "../db/index.js";
import { roles, userToRoles, departments, roleToCustomDepts, users } from "@forge/shared";
import { eq } from "drizzle-orm";

// 递归查找指定部门下的所有子部门 ID (包含自身)
async function getDeptAndChildIds(deptId: number): Promise<number[]> {
  const allDepts = await db
    .select({ id: departments.id, parentId: departments.parentId })
    .from(departments);

  const ids: number[] = [deptId];

  const findChildren = (parentId: number) => {
    for (const dept of allDepts) {
      if (dept.parentId === parentId) {
        ids.push(dept.id);
        findChildren(dept.id);
      }
    }
  };

  findChildren(deptId);
  return Array.from(new Set(ids));
}

// 核心函数：根据当前登录人计算其有权访问的部门 ID 列表，或返回 'all' / 'self'
export async function getDataScopeDeptIds(currentUser: {
  id: number;
}): Promise<number[] | "all" | "self"> {
  // 1. 查询当前用户的所有分配角色及其对应的数据范围 (dataScope)
  const userRoles = await db
    .select({
      id: roles.id,
      code: roles.code,
      dataScope: roles.dataScope,
    })
    .from(userToRoles)
    .innerJoin(roles, eq(userToRoles.roleId, roles.id))
    .where(eq(userToRoles.userId, currentUser.id));

  if (userRoles.length === 0) {
    return "self";
  }

  // 2. 如果包含全部数据权限，则直接返回 'all'
  const hasAllScope = userRoles.some((r) => r.dataScope === "all" || r.code === "ROLE_SUPER_ADMIN");
  if (hasAllScope) {
    return "all";
  }

  // 3. 查询用户所归属的部门
  const [userDept] = await db
    .select({ departmentId: users.departmentId })
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  const userDeptId = userDept?.departmentId || null;

  // 4. 遍历所有角色，合并累加部门权限范围 (并集原则)
  const deptIdsSet = new Set<number>();
  let hasSelfScopeOnly = true;

  for (const role of userRoles) {
    const scope = role.dataScope;

    if (scope === "dept" && userDeptId) {
      deptIdsSet.add(userDeptId);
      hasSelfScopeOnly = false;
    } else if (scope === "dept_child" && userDeptId) {
      const childIds = await getDeptAndChildIds(userDeptId);
      for (const id of childIds) {
        deptIdsSet.add(id);
      }
      hasSelfScopeOnly = false;
    } else if (scope === "custom") {
      const customDepts = await db
        .select({ deptId: roleToCustomDepts.deptId })
        .from(roleToCustomDepts)
        .where(eq(roleToCustomDepts.roleId, role.id));

      for (const cd of customDepts) {
        deptIdsSet.add(cd.deptId);
      }
      hasSelfScopeOnly = false;
    }
  }

  // 5. 如果只包含 'self' 数据范围或者累计部门为空，则返回 'self'
  if (hasSelfScopeOnly || deptIdsSet.size === 0) {
    return "self";
  }

  return Array.from(deptIdsSet);
}
